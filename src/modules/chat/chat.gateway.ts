import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

@WebSocketGateway({ namespace: '/chat', cors: { origin: process.env.FRONTEND_URL || 'http://localhost:3001', credentials: true } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private onlineUsers = new Map<string, string>(); // userId -> socketId

  constructor(
    private chatService: ChatService, 
    private jwtService: JwtService,
    @InjectRepository(User) private userRepository: Repository<User>
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = this.extractToken(client);
      const payload = this.jwtService.verify(token);
      const userId = payload.sub || payload.id || payload.userId;
      (client as any).userId = userId;

      this.onlineUsers.set(userId, client.id);
      console.log(`[Socket] User Connected: ${userId}`);
      this.server.emit('user:status', { userId, isOnline: true });

      const conversations = await this.chatService.listConversations(userId);
      conversations.forEach((c) => client.join(this.roomForConversation(c.id)));
    } catch (e) {
      console.error(`[Socket] Connection failed:`, e.message);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = (client as any).userId;
    if (userId) {
      console.log(`[Socket] User Disconnected: ${userId}`);
      this.onlineUsers.delete(userId);
      const lastActiveAt = new Date();
      await this.userRepository.update(userId, { lastActiveAt });
      this.server.emit('user:status', { userId, isOnline: false, lastActiveAt });
    }
  }

  @SubscribeMessage('user:status:get')
  async onGetStatus(@ConnectedSocket() client: Socket, @MessageBody() body: { userId: string }) {
    console.log(`[Socket] onGetStatus called for userId:`, body?.userId);
    const isOnline = this.onlineUsers.has(body.userId);
    let lastActiveAt = null;
    if (!isOnline) {
      const user = await this.userRepository.findOne({ where: { id: body.userId } });
      lastActiveAt = user?.lastActiveAt;
    }
    const res = { userId: body.userId, isOnline, lastActiveAt };
    console.log(`[Socket] onGetStatus returning:`, res);
    return res;
  }

  @SubscribeMessage('message:send')
  async onSendMessage(@ConnectedSocket() client: Socket, @MessageBody() body: SendMessageDto) {
    const userId = (client as any).userId as string;
    const msg = await this.chatService.sendMessage(body.conversationId, userId, body.content);
    const room = this.roomForConversation(body.conversationId);
    this.server.to(room).emit('message:new', msg);
    return msg;
  }

  @SubscribeMessage('conversation:typing')
  async onTyping(@ConnectedSocket() client: Socket, @MessageBody() body: { conversationId: string; isTyping: boolean }) {
    const userId = (client as any).userId as string;
    const room = this.roomForConversation(body.conversationId);
    client.to(room).emit('conversation:typing', { conversationId: body.conversationId, userId, isTyping: body.isTyping });
  }

  @SubscribeMessage('conversation:read')
  async onRead(@ConnectedSocket() client: Socket, @MessageBody() body: { conversationId: string }) {
    const userId = (client as any).userId as string;
    const result = await this.chatService.markAsRead(body.conversationId, userId);
    const room = this.roomForConversation(body.conversationId);
    client.to(room).emit('conversation:read', result);
    return result;
  }

  private extractToken(client: Socket) {
    const auth = client.handshake.auth?.token || client.handshake.headers['authorization'];
    if (typeof auth === 'string' && auth.startsWith('Bearer ')) return auth.slice(7);
    if (typeof auth === 'string') return auth;
    throw new Error('Unauthorized');
  }

  private roomForConversation(id: string) {
    return `conversation:${id}`;
  }
}
