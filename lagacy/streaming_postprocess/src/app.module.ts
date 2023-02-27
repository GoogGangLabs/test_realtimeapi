import { Module, CacheModule } from '@nestjs/common';
import * as redisStore from 'cache-manager-ioredis';

import ControllerModule from '@controller/controller.module';
import GatewayModule from '@gateway/gateway.module';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    }),
    ControllerModule,
    GatewayModule,
  ],
})
class AppModule {}

export default AppModule;
