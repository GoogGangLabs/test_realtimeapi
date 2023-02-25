import { Inject, CACHE_MANAGER, OnModuleInit } from '@nestjs/common';
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
import { Cache } from 'cache-manager';
import { credentials } from '@grpc/grpc-js';

import ClientSocket from '@domain/client.socket';

import { StreamRequest, InferenceResponse } from '@grpc/inference/inference_pb';
import { InferenceClient } from '@grpc/inference/inference_grpc_pb';

@WebSocketGateway(4000, { cors: { origin: '*', credentials: true } })
class StreamGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private readonly server: Server;

  private readonly client: InferenceClient[];

  private sequence: number = 0;

  constructor(
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {
    let ip = 7;
    this.client = Array.from({ length: 5 }, () => new InferenceClient(`172.20.0.${ip++}:50051`, credentials.createInsecure()));
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
  receiveStream(@ConnectedSocket() client: ClientSocket, @MessageBody('sequence') sequence: number, @MessageBody('frame') frame: Buffer, @MessageBody('timestamp') timestamp: number) {
    const serverTime = Date.now()
    const request = new StreamRequest();
    request.setSessionid(client.sessionId);
    request.setSequence(sequence);
    request.setStartedat(timestamp);
    request.setImage(Buffer.from(frame));
    request.setTimestampList([serverTime]);
    request.setStepList([serverTime - timestamp]);
    this.client[this.sequence].inputStream(request, (err, res: InferenceResponse) => {
      if (err) {
        console.log(err);
      }
    })
    if (this.sequence === 4) this.sequence = -1;
    this.sequence++;
  }
}

export default StreamGateway;
