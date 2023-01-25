import { Inject, CACHE_MANAGER } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

import ClientSocket from '@domain/client.socket';
import PreStreamDto from '@domain/pre.stream.dto';
import { Cache } from 'cache-manager';

@WebSocketGateway(4000, { cors: { origin: '*', credentials: true } })
class StreamGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private readonly server: Server;

  constructor(
    @Inject('STREAM_SERVICE') private readonly redisClient: ClientProxy,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  async handleConnection(client: ClientSocket) {
    const sessionId = client.handshake.headers['sessionid'] as string;
    const sessionValue = await this.cacheManager.get(sessionId);

    if (!sessionId || !sessionValue) {
      client.emit('server:preprocess:error', '인증정보가 유효하지 않습니다.');
      await this.handleDisconnect(client);
      return;
    }

    client.sessionId = sessionId;
    client.join(client.sessionId);
    client.emit('server:preprocess:connection');
  }

  async handleDisconnect(client: ClientSocket) {
    client.rooms.clear();
    client.disconnect();
  }

  @SubscribeMessage('client:preprocess:stream')
  receiveStream(@ConnectedSocket() client: ClientSocket, @MessageBody('frame') frame: string) {
    this.redisClient.emit('STREAM_PREPROCESS', PreStreamDto.fromData(client.sessionId, frame));
  }
}

export default StreamGateway;
