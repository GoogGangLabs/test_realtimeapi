import { Module } from '@nestjs/common';

import RedisController from '@controller/redis.controller';
import StreamGateway from '@gateway/stream.gateway';

@Module({
  controllers: [RedisController],
  providers: [StreamGateway],
})
class ControllerModule {}

export default ControllerModule;