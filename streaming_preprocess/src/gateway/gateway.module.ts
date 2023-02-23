import { Module, CacheModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import * as redisStore from 'cache-manager-ioredis';

import StreamGateway from '@gateway/stream.gateway';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

@Module({
  imports: [
    // RabbitMQModule.forRootAsync(RabbitMQModule, {
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: (configService: ConfigService) => {
    //     const username = configService.get('RABBITMQ_USERNAME');
    //     const password = configService.get('RABBITMQ_PASSWORD');
    //     const host = configService.get('RABBITMQ_HOST');

    //     return { uri: `amqp://${username}:${password}@${host}` }
    //   }
    // }),
    // ClientsModule.register([
    //   {
    //     name: 'INFERENCE_PACKAGE',
    //     transport: Transport.GRPC,
    //     options: {
    //       url: `${process.env.DEEP_LEARNING_HOST}:8000`,
    //       package: 'inference',
    //       protoPath: join(__dirname, "../../inference.proto")
    //     }
    //   }
    // ]),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get<string>('REDIS_HOST') || 'localhost',
        port: configService.get<number>('REDIS_PORT') || 6379,
      }),
    }),
  ],
  providers: [StreamGateway],
})
class GatewayModule {}

export default GatewayModule;
