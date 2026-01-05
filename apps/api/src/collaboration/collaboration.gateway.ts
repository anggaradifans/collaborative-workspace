import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PersistenceService } from '../persistence/persistence.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class CollaborationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Track users: roomId -> Map(socketId -> userData)
  private roomUsers = new Map<string, Map<string, any>>();

  constructor(private persistenceService: PersistenceService) { }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);

    // Find and remove user from all rooms they were in
    this.roomUsers.forEach((users, roomId) => {
      if (users.has(client.id)) {
        users.delete(client.id);
        this.broadcastPresence(roomId);
      }
    });
  }

  @SubscribeMessage('join-room')
  async handleJoinRoom(
    @MessageBody() data: { roomId: string; user: any },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, user } = data;
    client.join(roomId);

    // Update presence
    let usersMap = this.roomUsers.get(roomId);
    if (!usersMap) {
      usersMap = new Map();
      this.roomUsers.set(roomId, usersMap);
    }
    usersMap.set(client.id, user);

    console.log(`User ${user.name} joined room ${roomId}`);
    this.broadcastPresence(roomId);

    // Send existing state if any
    const state = await this.persistenceService.getState(roomId);
    if (state) {
      client.emit('state-updated', state);
    }

    return { event: 'joined', data: roomId };
  }

  @SubscribeMessage('update-state')
  async handleUpdateState(
    @MessageBody() data: { roomId: string; update: Uint8Array },
    @ConnectedSocket() client: Socket,
  ) {
    client.to(data.roomId).emit('state-updated', data.update);
    await this.persistenceService.saveState(data.roomId, data.update);
  }

  private broadcastPresence(roomId: string) {
    const usersMap = this.roomUsers.get(roomId);
    const users = usersMap ? Array.from(usersMap.values()) : [];
    this.server.to(roomId).emit('room-users', users);
  }
}
