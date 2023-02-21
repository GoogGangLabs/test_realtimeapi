import { Inject, CACHE_MANAGER } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { ConfigService } from '@nestjs/config';
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

  private readonly channel: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly amqpConnection: AmqpConnection,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {
    this.channel = this.configService.get('RABBITMQ_PRE_EXCHANGE');
  }

  async handleConnection(client: ClientSocket) {
    // const sessionId = client.handshake.headers['sessionid'] as string;
    // const sessionValue = await this.cacheManager.get(sessionId);

    // if (!sessionId || !sessionValue) {
    //   client.emit('server:preprocess:error', '인증정보가 유효하지 않습니다.');
    //   await this.handleDisconnect(client);
    //   return;
    // }

    client.sessionId = '123';
    client.sequence = 0;
    client.join(client.sessionId);
    client.emit('server:preprocess:connection');
  }

  async handleDisconnect(client: ClientSocket) {
    client.rooms.clear();
    client.disconnect();
  }

  @SubscribeMessage('client:preprocess:stream')
  receiveStream(@ConnectedSocket() client: ClientSocket, @MessageBody('frame') frame: string) {
    this.amqpConnection.publish(this.channel, '', PreStreamDto.fromData(client.sessionId, client.sequence++, frame));
  }
}

export default StreamGateway;
