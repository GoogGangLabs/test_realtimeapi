import { CACHE_MANAGER, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Cache } from 'cache-manager';
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
import { v4 } from 'uuid';

import ClientSocket from '@domain/client.socket';
import PreStreamDto from '@domain/pre.stream.dto';

@WebSocketGateway(4000, { cors: { origin: '*', credentials: true } })
class StreamGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private readonly server: Server;

  constructor(
    @Inject('STREAM_SERVICE') private redisClient: ClientProxy,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  private uuid = () => {
    const tokens = v4().split('-');
    return tokens[2] + tokens[1] + tokens[0] + tokens[3] + tokens[4];
  };

  async handleConnection(client: ClientSocket) {
    const code = String(client.handshake.headers['code']);
    const sessionId = String(client.handshake.headers['sessionId']);

    if ((code && code !== process.env.ENTRY_CODE) || (sessionId && (await this.cacheManager.get(sessionId)))) {
      client.emit('server:error', '인증정보가 유효하지 않습니다.');
      return;
    }

    client.sessionId = this.uuid();

    await this.cacheManager.set(client.sessionId, 1);

    client.join(client.sessionId);
    client.emit('server:preprocess:connection', client.sessionId);
  }

  async handleDisconnect(client: ClientSocket) {
    await this.cacheManager.set(client.sessionId, 0);
    client.rooms.clear();
    client.disconnect();
  }

  @SubscribeMessage('client:preprocess:stream')
  receiveStream(@ConnectedSocket() client: ClientSocket, @MessageBody('frame') frame: string) {
    this.redisClient.emit('STREAM_PREPROCESS', PreStreamDto.fromData(client.sessionId, frame));
  }
}

export default StreamGateway;
