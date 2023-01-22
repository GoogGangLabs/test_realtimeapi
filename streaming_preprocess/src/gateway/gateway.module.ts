import { Module, CacheModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import RedisStore from 'cache-manager-ioredis';

import StreamGateway from '@gateway/stream.gateway';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'STREAM_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.REDIS,
          options: {
            host: configService.get<string>('REDIS_HOST'),
            port: configService.get<number>('REDIS_PORT'),
          },
        }),
      },
    ]),
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
