import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

import ClientSocket from '@domain/client.socket';
import PostStreamDto from '@domain/post.stream.dto';

@WebSocketGateway(5000, { cors: { origin: process.env.CLIENT_HOST, credentials: true } })
class StreamGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private readonly server: Server;

  handleConnection(client: ClientSocket) {
    client.sessionId = String(client.handshake.headers['sessionid']);
    client.join(client.sessionId);
  }

  handleDisconnect(client: ClientSocket) {
    client.rooms.clear();
    client.disconnect();
  }

  sendStream(postStreamDto: PostStreamDto) {
    this.server.to(postStreamDto.sessionId).emit('server:postprocess:stream', postStreamDto.result);
  }
}

export default StreamGateway;
