import { Module, CacheModule } from '@nestjs/common';
import RedisStore from 'cache-manager-ioredis';

import StreamGateway from '@gateway/stream.gateway';

@Module({
  imports: [
    CacheModule.register({
      store: RedisStore,
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    }),
  ],
  providers: [StreamGateway],
})
class GatewayModule {}

export default GatewayModule;
