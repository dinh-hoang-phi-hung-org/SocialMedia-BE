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
  private userSocketMap = new Map<string, string>(); // userUuid -> socketId

  constructor(private readonly redisService: RedisService) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    // Remove user from the map when disconnected
    for (const [userUuid, socketId] of this.userSocketMap.entries()) {
      if (socketId === client.id) {
        this.userSocketMap.delete(userUuid);
        break;
      }
    }
  }

  @SubscribeMessage('authenticate')
  handleAuthenticate(client: Socket, userUuid: string) {
    this.logger.log(`User ${userUuid} authenticated on socket ${client.id}`);
    this.userSocketMap.set(userUuid, client.id);
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
  handleStartCall(client: Socket, payload: CallSignalDto) {
    this.logger.log(`Call started in conversation: ${payload.conversationUuid}`);

    client.to(payload.conversationUuid).emit('call:incoming', {
      ...payload,
      roomName: payload.roomName || payload.conversationUuid,
      startedAt: new Date().toISOString(),
    });

    return { status: 'ringing', roomName: payload.roomName || payload.conversationUuid };
  }

  @SubscribeMessage('call:decline')
  handleDeclineCall(
    client: Socket,
    payload: { conversationUuid: string; roomName: string; declinedByUuid: string; declinedByName?: string },
  ) {
    this.logger.log(`Call declined in conversation: ${payload.conversationUuid}`);

    client.to(payload.conversationUuid).emit('call:declined', {
      ...payload,
      declinedAt: new Date().toISOString(),
    });

    return { status: 'declined', roomName: payload.roomName };
  }

  @SubscribeMessage('call:end')
  handleEndCall(
    client: Socket,
    payload: { conversationUuid: string; roomName: string; endedByUuid: string; endedByName?: string },
  ) {
    this.logger.log(`Call ended in conversation: ${payload.conversationUuid}`);

    client.to(payload.conversationUuid).emit('call:ended', {
      ...payload,
      endedAt: new Date().toISOString(),
    });

    return { status: 'ended', roomName: payload.roomName };
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
    const socketId = this.userSocketMap.get(userId);
    if (socketId) {
      this.server.to(socketId).emit(event, data);
      this.logger.log(`Sent ${event} to user ${userId} via socket ${socketId}`);
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
      const socketId = this.userSocketMap.get(excludeUser);
      if (socketId) {
        this.server.to(conversationId).except(socketId).emit(event, data);
      } else {
        this.server.to(conversationId).emit(event, data);
      }
    } else {
      this.server.to(conversationId).emit(event, data);
    }
  }
}
