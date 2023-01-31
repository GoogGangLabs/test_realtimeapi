import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

import AppModule from '@src/app.module';

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const user = configService.get('RABBITMQ_USERNAME');
  const password = configService.get('RABBITMQ_PASSWORD');
  const host = configService.get('RABBITMQ_HOST');
  const queueName = configService.get('RABBITMQ_QUEUE_NAME');

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [ `amqp://${user}:${password}@${host}` ],
      queue: queueName,
      queueOptions: {
        durable: false
      }
    },
  });

  app.startAllMicroservices();

  console.log(`=== ENV: ${process.env.NODE_ENV}`);
  console.log(`=== Service: Streaming Postprocess`);
};

bootstrap();
