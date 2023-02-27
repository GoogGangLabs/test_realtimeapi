import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';

import StreamGateway from '@gateway/stream.gateway';
import PostStreamDto from '@domain/post.stream.dto';

@Controller()
class RedisController {
  constructor(private readonly streamGateway: StreamGateway) {}

  @EventPattern('STREAM_POSTPROCESS')
  subscribe(postStreamDto: PostStreamDto) {
    this.streamGateway.sendStream(postStreamDto);
  }
}

export default RedisController;