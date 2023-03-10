import { CACHE_MANAGER, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

import ClientSocket from '@domain/client.socket';
import PostStreamDto from '@domain/post.stream.dto';
import FrameManager from '@domain/frame.manager';

@WebSocketGateway(5000, { cors: { origin: '*', credentials: true } })
class StreamGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private readonly server: Server;

  private frameManager = new FrameManager();

  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async handleConnection(client: ClientSocket) {
    // const sessionId = client.handshake.headers['sessionid'] as string;
    // const sessionValue = await this.cacheManager.get(sessionId);

    // if (!sessionId || !sessionValue) {
    //   client.emit('server:postprocess:error', '인증정보가 유효하지 않습니다.');
    //   await this.handleDisconnect(client);
    //   return;
    // }

    client.sessionId = '123';
    client.join(client.sessionId);
  }

  async handleDisconnect(client: ClientSocket) {
    client.rooms.clear();
    client.disconnect();
  }

  sendStream(postStreamDto: PostStreamDto) {
    const serverTime = Date.now();
    postStreamDto.fps = this.frameManager.calculateFrame();
    postStreamDto.step.push(serverTime - postStreamDto.timestamp[postStreamDto.timestamp.length - 1]);
    postStreamDto.timestamp.push(serverTime);
    this.server.to(postStreamDto.sessionId).emit('server:postprocess:stream', postStreamDto);
  }
}

export default StreamGateway;
