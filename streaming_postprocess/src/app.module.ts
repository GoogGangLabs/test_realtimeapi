import { Module, CacheModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { path } from 'app-root-path';
import RedisStore from 'cache-manager-ioredis';

import ControllerModule from '@controller/controller.module';
import GatewayModule from '@gateway/gateway.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `${path}/.env.${process.env.NODE_ENV}`,
    }),
    CacheModule.register({
      isGlobal: true,
      store: RedisStore,
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    }),
    ControllerModule,
    GatewayModule,
  ],
})
class AppModule {}

export default AppModule;
