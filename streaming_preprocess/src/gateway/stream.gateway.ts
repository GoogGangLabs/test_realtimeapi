import { Inject, CACHE_MANAGER } from '@nestjs/common';
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
import FrameManager from '@domain/frame.manager';

@WebSocketGateway(4000, { cors: { origin: '*', credentials: true } })
class StreamGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private readonly server: Server;

  private readonly client: InferenceClient[];

  private readonly frameManager = new FrameManager();

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
    request.setImage(frame);
    request.setTimestampList([serverTime]);
    request.setStepList([serverTime - timestamp]);
    this.client[this.sequence].inputStream(request, (err, res: InferenceResponse) => {
      if (err) {
        console.log(`${sequence} - server: ${this.sequence + 1}, message: ${err.details}`);
      } else if (res) {
        const response = res.toObject();
        const serverTime = Date.now();
        const fps = this.frameManager.calculateFrame();
        response.stepList.push(serverTime - response.timestampList[response.timestampList.length - 1]);
        response.timestampList.push(serverTime);
        client.emit('server:postprocess:stream', {
          sessionId: response.sessionid,
          sequence: response.sequence,
          startedAt: response.startedat,
          timestamp: response.timestampList,
          step: response.stepList,
          result: {
            face: response.result.faceList,
            left_hand: response.result.leftHandList,
            right_hand: response.result.rightHandList,
            pose: response.result.poseList,
          },
          fps: fps
        });
      }
    })
    if (this.sequence === 4) this.sequence = -1;
    this.sequence++;
  }
}

export default StreamGateway;
