import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import AppModule from '@src/app.module';

const bootstrap = async () => {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.REDIS,
    options: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT, 10),
    },
  });

  await app.listen();

  console.log(`=== ENV: ${process.env.NODE_ENV}`);
  console.log(`=== Service: Streaming Postprocess`);
};

bootstrap();
