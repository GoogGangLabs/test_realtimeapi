import { Injectable } from "@nestjs/common";
import { credentials, ServiceError } from '@grpc/grpc-js';

import FrameManager from "@strategy/frame.manager";
import StreamResponseDto from "@domain/stream.response.dto";

import { StreamRequest, InferenceResponse } from '@grpc/inference/inference_pb';
import { InferenceClient } from '@grpc/inference/inference_grpc_pb';
import CalculateLatency from "@strategy/calculate.latency";

@Injectable()
class GrpcService {
  private readonly client: InferenceClient[];

  private readonly frameManager = new FrameManager();

  private sequence: number = 0;

  constructor() {
    let ip = 7;
    this.client = Array.from({ length: 5 }, () => new InferenceClient(`172.20.0.${ip++}:50051`, credentials.createInsecure()));
  }

  inputStream(streamRequest: StreamRequest): StreamResponseDto {
    let result: StreamResponseDto | null = null;
    
    this.client[this.sequence].inputStream(streamRequest, (err: ServiceError, res: InferenceResponse) => {
      if (err) {
        // todo: throw error
        console.log(`${streamRequest.getSequence()} - server: ${this.sequence + 1}, message: ${err.details}`);
      } else if (res) {
        result = StreamResponseDto.fromResponse(res, this.frameManager.calculateFrame());
      }
    })
    return result;
  }

}

export default GrpcService;