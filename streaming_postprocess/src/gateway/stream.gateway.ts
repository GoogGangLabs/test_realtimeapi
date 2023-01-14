import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

import ClientSocket from '@domain/client.socket';
import StreamObject from '@domain/stream.object';

@WebSocketGateway(4001, { cors: { origin: 'http://localhost:3000', credentials: true } })
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

  sendStream([sessionId, deepLearningResult]: StreamObject) {
    this.server.to(sessionId).emit('server:postprocess:stream');
  }
}

export default StreamGateway;
