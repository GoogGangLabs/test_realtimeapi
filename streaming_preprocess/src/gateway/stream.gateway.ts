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

import ClientSocket from '@domain/client.socket';
import PreStreamDto from '@domain/pre.stream.dto';
import { Cache } from 'cache-manager';
import { Client, ClientGrpc, Transport } from '@nestjs/microservices';
import { map, Observable } from 'rxjs';
import { join } from 'path';

import { StreamRequest, InferenceResponse} from '@generated/inference_pb';
import { InferenceClient } from '@generated/inference_grpc_pb';

const PROTO_PATH = '../../../grpc/inference.proto';

@WebSocketGateway(4000, { cors: { origin: '*', credentials: true } })
class StreamGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
  @WebSocketServer()
  private readonly server: Server;

  private readonly channel: string;

  @Client({
    transport: Transport.GRPC,
    options: {
      url: `${process.env.DEEP_LEARNING_HOST}:50051`,
      package: 'inference',
      protoPath: join(__dirname, '../../../grpc/inference.proto')
    }
  })
  private readonly client: ClientGrpc;

  private inferenceService: InferenceClient;

  constructor(
    private readonly configService: ConfigService,
    // private readonly amqpConnection: AmqpConnection,
    // @Inject('INFERENCE_PACKAGE') private readonly client: ClientGrpc,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {
    // this.channel = this.configService.get('RABBITMQ_PRE_EXCHANGE');
  }

  onModuleInit() {
    this.inferenceService = this.client.getService<InferenceClient>('Inference');
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
    request.setFrame(frame);
    request.setTimestampList([serverTime]);
    request.setStepList([serverTime - timestamp]);
    // const payload = PreStreamDto.fromData(client.sessionId, sequence, frame, timestamp);
    this.inferenceService.inputStream(request, (err, response: InferenceResponse) => {
      console.log(err);
      console.log(response)
    });
    // this.amqpConnection.publish(this.channel, '', payload);
  }
}

export default StreamGateway;
