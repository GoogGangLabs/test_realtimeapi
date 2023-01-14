import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';

import StreamGateway from '@gateway/stream.gateway';

import StreamObject from '@domain/stream.object';

@Controller()
class RedisController {
  constructor(private readonly streamGateway: StreamGateway) {}

  @EventPattern('STREAM_POSTPROCESS')
  subscribe([sessionId]: StreamObject) {
    this.streamGateway.sendStream(sessionId);
  }
}

export default RedisController;
