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

// Video call interfaces
interface VideoCallInitiateDto {
  callerId: string;
  callerName: string;
  receiverId: string;
  conversationId: string;
  callType: 'video' | 'audio';
}

interface VideoCallResponseDto {
  callId: string;
  accepted: boolean;
  receiverId: string;
}

interface VideoCallEndDto {
  callId: string;
  participantId: string;
}

interface WebRTCSignalDto {
  callId: string;
  signal: any; // WebRTC signal data
  from: string;
  to: string;
}

@WebSocketGateway({
  cors: {
    credentials: true,
    methods: ['GET', 'POST'],
    // Temporarily allow all origins for debugging
    origin: true,
  },
  namespace: 'chat',
})
export class SocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger = new Logger('SocketGateway');
  private userSocketMap = new Map<string, string>(); // userUuid -> socketId
  private activeCalls = new Map<string, { callerId: string; receiverId: string; callType: string; status: string }>(); // callId -> call info

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

  // ===== VIDEO CALL EVENTS =====

  @SubscribeMessage('initiateVideoCall')
  handleInitiateVideoCall(client: Socket, payload: VideoCallInitiateDto) {
    const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.logger.log(`Video call initiated: ${callId} from ${payload.callerId} to ${payload.receiverId}`);

    // Store call information
    this.activeCalls.set(callId, {
      callerId: payload.callerId,
      receiverId: payload.receiverId,
      callType: payload.callType,
      status: 'ringing',
    });

    // Send incoming call notification to receiver
    this.sendToUser(payload.receiverId, 'incomingVideoCall', {
      callId,
      callerId: payload.callerId,
      callerName: payload.callerName,
      conversationId: payload.conversationId,
      callType: payload.callType,
    });

    // Send call initiated confirmation to caller
    client.emit('videoCallInitiated', { callId, status: 'ringing' });

    return { callId, status: 'initiated' };
  }

  @SubscribeMessage('answerVideoCall')
  handleAnswerVideoCall(client: Socket, payload: VideoCallResponseDto) {
    const call = this.activeCalls.get(payload.callId);

    if (!call) {
      client.emit('videoCallError', { message: 'Call not found' });
      return;
    }

    this.logger.log(
      `Video call ${payload.callId} ${payload.accepted ? 'accepted' : 'rejected'} by ${payload.receiverId}`,
    );

    if (payload.accepted) {
      // Update call status
      this.activeCalls.set(payload.callId, { ...call, status: 'connected' });

      // Notify caller that call was accepted
      this.sendToUser(call.callerId, 'videoCallAccepted', {
        callId: payload.callId,
        receiverId: payload.receiverId,
        receiverName: 'Unknown', // Add receiver name - should come from user data in production
      });

      // Confirm to receiver
      client.emit('videoCallAccepted', {
        callId: payload.callId,
        callerId: call.callerId,
        callerName: 'Unknown', // Add caller name - should come from user data in production
      });
    } else {
      // Call rejected
      this.activeCalls.delete(payload.callId);

      // Notify caller that call was rejected
      this.sendToUser(call.callerId, 'videoCallRejected', {
        callId: payload.callId,
        receiverId: payload.receiverId,
      });
    }

    return { status: payload.accepted ? 'accepted' : 'rejected' };
  }

  @SubscribeMessage('receiverReady')
  handleReceiverReady(client: Socket, payload: { callId: string; receiverId: string }) {
    const call = this.activeCalls.get(payload.callId);

    if (!call) {
      this.logger.error(`❌ Call not found for receiverReady: ${payload.callId}`);
      client.emit('videoCallError', { message: 'Call not found' });
      return;
    }

    this.logger.log(`🎯 Receiver ${payload.receiverId} is ready for call ${payload.callId}`);
    this.logger.log(`🎯 Forwarding receiverReady to caller: ${call.callerId}`);

    // Notify caller that receiver is ready to proceed with WebRTC negotiation
    this.sendToUser(call.callerId, 'receiverReady', {
      callId: payload.callId,
      receiverId: payload.receiverId,
    });

    this.logger.log(`✅ ReceiverReady signal sent to caller successfully`);
    return { status: 'receiver_ready' };
  }

  @SubscribeMessage('endVideoCall')
  handleEndVideoCall(client: Socket, payload: VideoCallEndDto) {
    const call = this.activeCalls.get(payload.callId);

    if (!call) {
      return;
    }

    this.logger.log(`Video call ${payload.callId} ended by ${payload.participantId}`);

    // Notify other participant
    const otherParticipant = payload.participantId === call.callerId ? call.receiverId : call.callerId;
    this.sendToUser(otherParticipant, 'videoCallEnded', {
      callId: payload.callId,
      endedBy: payload.participantId,
    });

    // Remove call from active calls
    this.activeCalls.delete(payload.callId);

    return { status: 'ended' };
  }

  @SubscribeMessage('webrtcSignal')
  handleWebRTCSignal(client: Socket, payload: WebRTCSignalDto) {
    this.logger.log(`WebRTC signal for call ${payload.callId} from ${payload.from} to ${payload.to}`);

    // Forward WebRTC signal to the target user
    this.sendToUser(payload.to, 'webrtcSignal', {
      callId: payload.callId,
      signal: payload.signal,
      from: payload.from,
    });
  }

  @SubscribeMessage('webrtcOffer')
  handleWebRTCOffer(client: Socket, payload: WebRTCSignalDto) {
    this.logger.log(`WebRTC offer for call ${payload.callId} from ${payload.from} to ${payload.to}`);

    this.sendToUser(payload.to, 'webrtcOffer', {
      callId: payload.callId,
      offer: payload.signal,
      from: payload.from,
    });
  }

  @SubscribeMessage('webrtcAnswer')
  handleWebRTCAnswer(client: Socket, payload: any) {
    this.logger.log(`📨 WebRTC answer received for call ${payload.callId} from ${payload.from} to ${payload.to}`);
    this.logger.log(`📨 Answer type: ${payload.answer?.type}, SDP length: ${payload.answer?.sdp?.length || 0}`);

    this.sendToUser(payload.to, 'webrtcAnswer', {
      callId: payload.callId,
      answer: payload.answer,
      from: payload.from,
    });
  }

  @SubscribeMessage('webrtcIceCandidate')
  handleWebRTCIceCandidate(client: Socket, payload: WebRTCSignalDto) {
    this.logger.log(`WebRTC ICE candidate for call ${payload.callId} from ${payload.from} to ${payload.to}`);

    this.sendToUser(payload.to, 'webrtcIceCandidate', {
      callId: payload.callId,
      candidate: payload.signal,
      from: payload.from,
    });
  }

  // Method to be called from other services
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sendToUser(userId: string, event: string, data: any) {
    const socketId = this.userSocketMap.get(userId);
    if (socketId) {
      this.server.to(socketId).emit(event, data);
      return true;
    }
    return false;
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

  // Get active calls for debugging
  getActiveCalls() {
    return Array.from(this.activeCalls.entries());
  }
}
