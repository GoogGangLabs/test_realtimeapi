import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

import StreamGateway from '@gateway/stream.gateway';

@Module({
  imports: [
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const username = configService.get('RABBITMQ_USERNAME');
        const password = configService.get('RABBITMQ_PASSWORD');
        const host = configService.get('RABBITMQ_HOST');

        return { uri: `amqp://${username}:${password}@${host}` }
      }
    })
  ],
  providers: [StreamGateway],
})
class GatewayModule {}

export default GatewayModule;
