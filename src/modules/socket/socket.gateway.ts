import {
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { CallLogOrmEntity, CallLogStatus, CallLogType } from '@/modules/call/infrastructure/orm/call-log.entity.orm';
import { MessageOrmEntity } from '@/modules/message/infrastructure/orm/message.entity.orm';
import { MessageType } from '@/shared/enum/message-type';
import { UserOrmEntity } from '@/modules/users/infrastructure/orm/users.entity.orm';
import { ConversationOrmEntity } from '@/modules/message/infrastructure/orm/conversation.entity.orm';

interface JoinRoomDto {
  conversationId: string;
}

interface MessageDto {
  conversationId: string;
  messageId: string;
  senderId: string;
  content: string;
}

interface CallSignalDto {
  conversationUuid: string;
  roomName: string;
  callType: 'voice' | 'video';
  callerUuid: string;
  callerName?: string;
  conversationTitle?: string;
}

interface CallActionDto {
  conversationUuid: string;
  roomName: string;
  isGroupCall?: boolean;
}

@WebSocketGateway({
  cors: {
    credentials: true,
    methods: ['GET', 'POST'],
    // Temporarily allow all origins for debugging
    origin: true,
  },
  namespace: 'socket',
})
export class SocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger = new Logger('SocketGateway');
  private userSocketMap = new Map<string, Set<string>>(); // userUuid -> socketIds
  private callTimeoutMap = new Map<string, NodeJS.Timeout>();
  private groupCallParticipants = new Map<string, Set<string>>();

  constructor(
    private readonly redisService: RedisService,
    @InjectRepository(CallLogOrmEntity)
    private readonly callLogRepository: Repository<CallLogOrmEntity>,
    @InjectRepository(MessageOrmEntity)
    private readonly messageRepository: Repository<MessageOrmEntity>,
    @InjectRepository(UserOrmEntity)
    private readonly userRepository: Repository<UserOrmEntity>,
    @InjectRepository(ConversationOrmEntity)
    private readonly conversationRepository: Repository<ConversationOrmEntity>,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    for (const [userUuid, socketIds] of this.userSocketMap.entries()) {
      socketIds.delete(client.id);
      if (socketIds.size === 0) {
        this.userSocketMap.delete(userUuid);
      }
    }
  }

  @SubscribeMessage('authenticate')
  handleAuthenticate(client: Socket, userUuid: string) {
    this.logger.log(`User ${userUuid} authenticated on socket ${client.id}`);
    const socketIds = this.userSocketMap.get(userUuid) || new Set<string>();
    socketIds.add(client.id);
    this.userSocketMap.set(userUuid, socketIds);
    client.emit('authenticate', { status: 'authenticated', userUuid });
    return { status: 'authenticated' };
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, payload: JoinRoomDto) {
    client.join(payload.conversationId);
    this.logger.log(`Client ${client.id} joined room: ${payload.conversationId}`);
    return { status: 'joined', room: payload.conversationId };
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(client: Socket, payload: JoinRoomDto) {
    client.leave(payload.conversationId);
    this.logger.log(`Client ${client.id} left room: ${payload.conversationId}`);
    return { status: 'left', room: payload.conversationId };
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(client: Socket, payload: MessageDto) {
    this.logger.log(`Message received in conversation: ${payload.conversationId}`);

    // Instead of using RedisService's set method, we'll store the data in memory
    // In a production app, you would want to save this to your database

    // Emit to everyone in the conversation except the sender
    client.to(payload.conversationId).emit('receiveMessage', payload);

    return { status: 'sent', messageId: payload.messageId };
  }

  @SubscribeMessage('typing')
  handleTyping(
    client: Socket,
    payload: { conversationId: string; userId: string; username?: string; isTyping: boolean },
  ) {
    this.logger.log(
      `User ${payload.userId} typing status: ${payload.isTyping} in conversation: ${payload.conversationId}`,
    );

    // Emit typing status to all other users in the conversation (exclude sender)
    client.to(payload.conversationId).emit('userTyping', {
      userId: payload.userId,
      username: payload.username || 'Unknown User',
      isTyping: payload.isTyping,
      conversationId: payload.conversationId,
    });
  }

  @SubscribeMessage('call:start')
  async handleStartCall(client: Socket, payload: CallSignalDto) {
    this.logger.log(`Call started in conversation: ${payload.conversationUuid}`);
    const conversation = await this.conversationRepository.findOne({
      where: { uuid: payload.conversationUuid },
    });
    const isGroupCall = Boolean(conversation?.isGroupChat);
    const startedAt = new Date();
    const callLog = await this.callLogRepository.save(
      this.callLogRepository.create({
        conversationUuid: payload.conversationUuid,
        roomName: payload.roomName || payload.conversationUuid,
        callerUuid: payload.callerUuid,
        callType: payload.callType as CallLogType,
        status: isGroupCall ? CallLogStatus.ONGOING : CallLogStatus.RINGING,
        startedAt,
        acceptedAt: isGroupCall ? startedAt : undefined,
      }),
    );

    if (isGroupCall) {
      this.groupCallParticipants.set(payload.roomName || payload.conversationUuid, new Set([payload.callerUuid]));
    }

    const incomingCallPayload = {
      ...payload,
      roomName: payload.roomName || payload.conversationUuid,
      callLogUuid: callLog.uuid,
      startedAt: startedAt.toISOString(),
      isGroupCall,
    };

    client.to(payload.conversationUuid).emit('call:incoming', incomingCallPayload);
    await this.sendCallEventToParticipants(payload.conversationUuid, 'call:incoming', incomingCallPayload, payload.callerUuid);

    if (!isGroupCall) {
      this.scheduleMissedCall(callLog.uuid, payload.conversationUuid, payload.roomName || payload.conversationUuid);
    }

    return {
      status: isGroupCall ? 'ongoing' : 'ringing',
      roomName: payload.roomName || payload.conversationUuid,
      callLogUuid: callLog.uuid,
      isGroupCall,
    };
  }

  @SubscribeMessage('call:decline')
  async handleDeclineCall(
    client: Socket,
    payload: CallActionDto & { declinedByUuid: string; declinedByName?: string },
  ) {
    this.logger.log(`Call declined in conversation: ${payload.conversationUuid}`);
    const isGroupCall = await this.isGroupConversation(payload.conversationUuid);

    if (isGroupCall) {
      const declinedPayload = {
        ...payload,
        isGroupCall: true,
        declinedAt: new Date().toISOString(),
      };
      client.to(payload.conversationUuid).emit('call:declined', declinedPayload);
      await this.sendCallEventToParticipants(
        payload.conversationUuid,
        'call:declined',
        declinedPayload,
        payload.declinedByUuid,
      );
      return { status: 'declined', roomName: payload.roomName, isGroupCall: true };
    }

    const callLog = await this.finishLatestCallLog(
      payload.roomName,
      payload.declinedByUuid,
      CallLogStatus.DECLINED,
    );
    if (callLog) {
      this.clearCallTimeout(callLog.uuid);
    }
    const message = callLog ? await this.createCallLogMessage(callLog, payload.declinedByUuid) : null;

    const declinedPayload = {
      ...payload,
      callLogUuid: callLog?.uuid,
      durationSeconds: callLog?.durationSeconds,
      declinedAt: new Date().toISOString(),
      isGroupCall: false,
    };

    const endedPayload = {
      conversationUuid: payload.conversationUuid,
      roomName: payload.roomName,
      endedByUuid: payload.declinedByUuid,
      endedByName: payload.declinedByName,
      reason: 'declined',
      callLogUuid: callLog?.uuid,
      durationSeconds: callLog?.durationSeconds,
      endedAt: new Date().toISOString(),
      isGroupCall: false,
    };

    client.to(payload.conversationUuid).emit('call:declined', declinedPayload);
    client.to(payload.conversationUuid).emit('call:ended', endedPayload);
    await this.sendCallEventToParticipants(payload.conversationUuid, 'call:declined', declinedPayload, payload.declinedByUuid);
    await this.sendCallEventToParticipants(payload.conversationUuid, 'call:ended', endedPayload, payload.declinedByUuid);

    if (message) {
      this.server.to(payload.conversationUuid).emit('receiveMessage', message);
      this.server.to(payload.conversationUuid).emit('updateConversation', {
        conversationUuid: payload.conversationUuid,
        lastMessage: message,
        updatedAt: new Date(),
      });
    }

    return { status: 'declined', roomName: payload.roomName };
  }

  @SubscribeMessage('call:accept')
  async handleAcceptCall(
    client: Socket,
    payload: CallActionDto & { acceptedByUuid: string; acceptedByName?: string },
  ) {
    this.logger.log(`Call accepted in conversation: ${payload.conversationUuid}`);
    const callLog = await this.callLogRepository.findOne({
      where: { roomName: payload.roomName, endedAt: IsNull() },
      order: { startedAt: 'DESC' },
    });

    if (callLog && !callLog.acceptedAt) {
      callLog.acceptedAt = new Date();
      callLog.status = CallLogStatus.ONGOING;
      await this.callLogRepository.save(callLog);
      this.clearCallTimeout(callLog.uuid);
    }

    const isGroupCall = await this.isGroupConversation(payload.conversationUuid);
    if (isGroupCall) {
      const participants = this.groupCallParticipants.get(payload.roomName) || new Set<string>();
      participants.add(payload.acceptedByUuid);
      this.groupCallParticipants.set(payload.roomName, participants);
    }

    const acceptedPayload = {
      ...payload,
      callLogUuid: callLog?.uuid,
      acceptedAt: callLog?.acceptedAt?.toISOString(),
      isGroupCall,
    };

    client.to(payload.conversationUuid).emit('call:accepted', acceptedPayload);
    await this.sendCallEventToParticipants(payload.conversationUuid, 'call:accepted', acceptedPayload, payload.acceptedByUuid);

    return { status: 'accepted', roomName: payload.roomName, callLogUuid: callLog?.uuid };
  }

  @SubscribeMessage('call:end')
  async handleEndCall(
    client: Socket,
    payload: CallActionDto & { endedByUuid: string; endedByName?: string },
  ) {
    this.logger.log(`Call ended in conversation: ${payload.conversationUuid}`);
    const isGroupCall = await this.isGroupConversation(payload.conversationUuid);

    if (isGroupCall) {
      const participants = this.groupCallParticipants.get(payload.roomName) || new Set<string>();
      participants.delete(payload.endedByUuid);
      const leftPayload = {
        ...payload,
        isGroupCall: true,
        leftAt: new Date().toISOString(),
      };
      client.to(payload.conversationUuid).emit('call:participant-left', leftPayload);

      if (participants.size > 0) {
        this.groupCallParticipants.set(payload.roomName, participants);
        return { status: 'left', roomName: payload.roomName, isGroupCall: true };
      }

      this.groupCallParticipants.delete(payload.roomName);
      const callLog = await this.finishLatestCallLog(payload.roomName, payload.endedByUuid, CallLogStatus.ENDED);
      const message = callLog ? await this.createCallLogMessage(callLog, payload.endedByUuid) : null;
      const endedPayload = {
        ...payload,
        isGroupCall: true,
        callLogUuid: callLog?.uuid,
        durationSeconds: callLog?.durationSeconds,
        endedAt: new Date().toISOString(),
      };
      client.to(payload.conversationUuid).emit('call:ended', endedPayload);
      await this.sendCallEventToParticipants(
        payload.conversationUuid,
        'call:ended',
        endedPayload,
        payload.endedByUuid,
      );
      if (message) {
        this.server.to(payload.conversationUuid).emit('receiveMessage', message);
        this.server.to(payload.conversationUuid).emit('updateConversation', {
          conversationUuid: payload.conversationUuid,
          lastMessage: message,
          updatedAt: new Date(),
        });
      }
      return { status: 'left', roomName: payload.roomName, isGroupCall: true };
    }

    const callLog = await this.finishLatestCallLog(payload.roomName, payload.endedByUuid, CallLogStatus.ENDED);
    if (callLog) {
      this.clearCallTimeout(callLog.uuid);
    }
    const message = callLog ? await this.createCallLogMessage(callLog, payload.endedByUuid) : null;

    const endedPayload = {
      ...payload,
      callLogUuid: callLog?.uuid,
      durationSeconds: callLog?.durationSeconds,
      endedAt: new Date().toISOString(),
      isGroupCall: false,
    };

    client.to(payload.conversationUuid).emit('call:ended', endedPayload);
    await this.sendCallEventToParticipants(payload.conversationUuid, 'call:ended', endedPayload, payload.endedByUuid);

    if (message) {
      this.server.to(payload.conversationUuid).emit('receiveMessage', message);
      this.server.to(payload.conversationUuid).emit('updateConversation', {
        conversationUuid: payload.conversationUuid,
        lastMessage: message,
        updatedAt: new Date(),
      });
    }

    return { status: 'ended', roomName: payload.roomName, durationSeconds: callLog?.durationSeconds };
  }

  private async finishLatestCallLog(roomName: string, endedByUuid: string, status: CallLogStatus) {
    const callLog = await this.callLogRepository.findOne({
      where: { roomName, endedAt: IsNull() },
      order: { startedAt: 'DESC' },
    });

    if (!callLog) {
      return null;
    }

    const endedAt = new Date();
    callLog.endedAt = endedAt;
    callLog.endedByUuid = endedByUuid;
    callLog.status = status;
    const durationStart = callLog.acceptedAt || endedAt;
    callLog.durationSeconds = Math.max(0, Math.round((endedAt.getTime() - durationStart.getTime()) / 1000));

    return this.callLogRepository.save(callLog);
  }

  private scheduleMissedCall(callLogUuid: string, conversationUuid: string, roomName: string) {
    this.clearCallTimeout(callLogUuid);

    const timeout = setTimeout(async () => {
      const callLog = await this.callLogRepository.findOne({
        where: { uuid: callLogUuid, endedAt: IsNull() },
      });

      if (!callLog || callLog.acceptedAt) {
        return;
      }

      const endedAt = new Date();
      callLog.endedAt = endedAt;
      callLog.status = CallLogStatus.MISSED;
      callLog.durationSeconds = 0;
      const savedCallLog = await this.callLogRepository.save(callLog);
      const message = await this.createCallLogMessage(savedCallLog, savedCallLog.callerUuid);

      const missedPayload = {
        conversationUuid,
        roomName,
        callLogUuid: savedCallLog.uuid,
        endedAt: endedAt.toISOString(),
      };
      const endedPayload = {
        conversationUuid,
        roomName,
        endedByUuid: savedCallLog.callerUuid,
        reason: 'missed',
        callLogUuid: savedCallLog.uuid,
        durationSeconds: 0,
        endedAt: endedAt.toISOString(),
      };

      this.server.to(conversationUuid).emit('call:missed', missedPayload);
      this.server.to(conversationUuid).emit('call:ended', endedPayload);
      await this.sendCallEventToParticipants(conversationUuid, 'call:missed', missedPayload);
      await this.sendCallEventToParticipants(conversationUuid, 'call:ended', endedPayload);
      this.server.to(conversationUuid).emit('receiveMessage', message);
      this.server.to(conversationUuid).emit('updateConversation', {
        conversationUuid,
        lastMessage: message,
        updatedAt: new Date(),
      });

      this.clearCallTimeout(callLogUuid);
    }, 30000);

    this.callTimeoutMap.set(callLogUuid, timeout);
  }

  private clearCallTimeout(callLogUuid: string) {
    const timeout = this.callTimeoutMap.get(callLogUuid);
    if (timeout) {
      clearTimeout(timeout);
      this.callTimeoutMap.delete(callLogUuid);
    }
  }

  private async isGroupConversation(conversationUuid: string) {
    const conversation = await this.conversationRepository.findOne({
      where: { uuid: conversationUuid },
      select: { isGroupChat: true },
    });

    return Boolean(conversation?.isGroupChat);
  }

  private async createCallLogMessage(callLog: CallLogOrmEntity, endedByUuid: string) {
    const durationText = this.formatCallDuration(callLog.durationSeconds || 0);
    const content =
      callLog.status === CallLogStatus.MISSED || callLog.status === CallLogStatus.DECLINED
        ? 'Missed call'
        : `Call - ${durationText}`;

    const message = await this.messageRepository.save(
      this.messageRepository.create({
        conversationUuid: callLog.conversationUuid,
        senderUuid: endedByUuid,
        content,
        mediaUrl: JSON.stringify({
          callLogUuid: callLog.uuid,
          roomName: callLog.roomName,
          callType: callLog.callType,
          status: callLog.status,
          durationSeconds: callLog.durationSeconds || 0,
        }),
        type: MessageType.NOTIFICATION,
      }),
    );

    await this.conversationRepository.update({ uuid: callLog.conversationUuid }, { updatedAt: new Date() });
    const sender = await this.userRepository.findOne({ where: { uuid: endedByUuid } });

    return {
      conversationUuid: message.conversationUuid,
      messageUuid: message.uuid,
      user: {
        uuid: sender?.uuid || endedByUuid,
        username: sender?.username || 'System',
        profilePictureUrl: sender?.profile_picture_url || '',
      },
      isMyMessage: false,
      content: message.content,
      mediaUrl: JSON.parse(message.mediaUrl),
      createdAt: message.createdAt,
      type: message.type,
    };
  }

  private formatCallDuration(durationSeconds: number) {
    const minutes = Math.floor(durationSeconds / 60);
    const seconds = durationSeconds % 60;

    if (minutes === 0) {
      return `${seconds} ${seconds === 1 ? 'second' : 'seconds'}`;
    }

    const minuteText = `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
    const secondText = seconds > 0 ? ` ${seconds} ${seconds === 1 ? 'second' : 'seconds'}` : '';
    return `${minuteText}${secondText}`;
  }

  private async sendCallEventToParticipants(
    conversationUuid: string,
    event: string,
    data: Record<string, unknown>,
    excludeUserUuid?: string,
  ) {
    const conversation = await this.conversationRepository.findOne({
      where: { uuid: conversationUuid },
      relations: ['participants'],
    });

    conversation?.participants?.forEach((participant) => {
      if (participant.userUuid !== excludeUserUuid) {
        this.sendToUser(participant.userUuid, event, data);
      }
    });
  }

  @SubscribeMessage('joinNotifications')
  handleJoinNotifications(client: Socket, userUuid: string) {
    client.join(`notifications_${userUuid}`);
    this.logger.log(`Client ${client.id} joined notifications for user: ${userUuid}`);
    client.emit('joinNotifications', { status: 'joined_notifications', userUuid });
    return { status: 'joined_notifications', userUuid };
  }

  @SubscribeMessage('leaveNotifications')
  handleLeaveNotifications(client: Socket, userUuid: string) {
    client.leave(`notifications_${userUuid}`);
    this.logger.log(`Client ${client.id} left notifications for user: ${userUuid}`);
    client.emit('leaveNotifications', { status: 'left_notifications', userUuid });
    return { status: 'left_notifications', userUuid };
  }

  // Method to be called from other services
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sendToUser(userId: string, event: string, data: any) {
    const socketIds = this.userSocketMap.get(userId);
    if (socketIds?.size) {
      socketIds.forEach((socketId) => this.server.to(socketId).emit(event, data));
      this.logger.log(`Sent ${event} to user ${userId} via ${socketIds.size} socket(s)`);
      return true;
    }
    // Fallback: send to notification room if direct socket not found
    this.server.to(`notifications_${userId}`).emit(event, data);
    this.logger.log(`Sent ${event} to user ${userId} via notification room`);
    return false;
  }

  // Method to send notification to specific user
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sendNotificationToUser(userId: string, notification: any) {
    this.sendToUser(userId, 'newNotification', notification);
  }

  // Method to be called from other services
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sendToConversation(conversationId: string, event: string, data: any, excludeUser?: string) {
    if (excludeUser) {
      const socketIds = [...(this.userSocketMap.get(excludeUser) || [])];
      if (socketIds.length) {
        this.server.to(conversationId).except(socketIds).emit(event, data);
      } else {
        this.server.to(conversationId).emit(event, data);
      }
    } else {
      this.server.to(conversationId).emit(event, data);
    }
  }
}
