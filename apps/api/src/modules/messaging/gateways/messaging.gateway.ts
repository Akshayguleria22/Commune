import {
  WebSocketGateway, WebSocketServer, SubscribeMessage,
  MessageBody, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/ws',
})
export class MessagingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MessagingGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('channel:join')
  handleJoinChannel(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { channelId: string },
  ) {
    client.join(`channel:${data.channelId}`);
    this.logger.debug(`${client.id} joined channel:${data.channelId}`);
  }

  @SubscribeMessage('channel:leave')
  handleLeaveChannel(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { channelId: string },
  ) {
    client.leave(`channel:${data.channelId}`);
  }

  @SubscribeMessage('message:send')
  handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { channelId: string; content: string; threadId?: string },
  ) {
    // In production, this would save to DB and then emit
    this.server.to(`channel:${data.channelId}`).emit('message:new', {
      channelId: data.channelId,
      content: data.content,
      threadId: data.threadId,
      authorId: (client as any).userId,
      createdAt: new Date().toISOString(),
    });
  }

  @SubscribeMessage('typing:start')
  handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { channelId: string },
  ) {
    client.to(`channel:${data.channelId}`).emit('typing:update', {
      channelId: data.channelId,
      userId: (client as any).userId,
      isTyping: true,
    });
  }

  @SubscribeMessage('typing:stop')
  handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { channelId: string },
  ) {
    client.to(`channel:${data.channelId}`).emit('typing:update', {
      channelId: data.channelId,
      userId: (client as any).userId,
      isTyping: false,
    });
  }

  // Utility to broadcast from other services
  broadcastToChannel(channelId: string, event: string, data: any) {
    this.server.to(`channel:${channelId}`).emit(event, data);
  }

  broadcastToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }
}
