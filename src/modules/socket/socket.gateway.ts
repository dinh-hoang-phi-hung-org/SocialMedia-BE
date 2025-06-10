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

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'chat',
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
}
