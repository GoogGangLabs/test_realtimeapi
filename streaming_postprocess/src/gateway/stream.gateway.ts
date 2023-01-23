import { CACHE_MANAGER, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

import ClientSocket from '@domain/client.socket';
import PostStreamDto from '@domain/post.stream.dto';

@WebSocketGateway(5000, { cors: { origin: '*', credentials: true } })
class StreamGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private readonly server: Server;

  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async handleConnection(client: ClientSocket) {
    const sessionId = client.handshake.headers['sessionid'] as string;

    if (sessionId && !(await this.cacheManager.get(sessionId))) {
      client.emit('server:postprocess:error', '인증정보가 유효하지 않습니다.');
      return;
    }

    client.sessionId = sessionId;
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
