import { Inject, CACHE_MANAGER } from '@nestjs/common';
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
import { Cache } from 'cache-manager';

import GrpcService from '@service/grpc.service';
import ClientSocket from '@domain/client.socket';
import StreamRequestDto from '@domain/stream.request.dto';

@WebSocketGateway(4000, { cors: { origin: '*', credentials: true } })
class StreamGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private readonly server: Server;

  constructor(
    private readonly grpcService: GrpcService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

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
  receiveStream(@ConnectedSocket() client: ClientSocket, @MessageBody('sequence') sequence: number, @MessageBody('frame') frame: Buffer, @MessageBody('timestamp') timestamp: number, @MessageBody('inputSize') inputSize: number) {
    this.grpcService.inputStream(client, StreamRequestDto.fromData(client.sessionId, sequence, frame, timestamp, inputSize));
  }
}

export default StreamGateway;
