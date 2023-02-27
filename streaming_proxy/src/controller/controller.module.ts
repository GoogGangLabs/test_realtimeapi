import { Module, CacheModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-ioredis';

import ViewController from '@controller/view.controller';
import AuthController from '@controller/auth.controller';
import LatencyController from '@controller/latency.controller';
import LatencyService from '@service/latency.service';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        isGlobal: true,
        store: redisStore,
        host: configService.get<string>('REDIS_HOST') || 'localhost',
        port: configService.get<number>('REDIS_PORT') || 6379,
      }),
    }),
  ],
  providers: [LatencyService],
  controllers: [ViewController, AuthController, LatencyController],
})
class ControllerModule {}

export default ControllerModule;
