import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { MicroserviceOptions } from '@nestjs/microservices';
import { path } from 'app-root-path';
import * as cookieParser from 'cookie-parser';

import AppModule from '@src/app.module';
import grpcClientOption from '@domain/grpc.option';

const bootstrap = async () => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const port = process.env.PORT || 3000;

  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());
  app.useStaticAssets(`${path}/public`);
  app.setBaseViewsDir(`${path}/public`);
  app.setViewEngine('ejs');
  app.connectMicroservice<MicroserviceOptions>(grpcClientOption);

  await app.startAllMicroservices();
  await app.listen(port, () => {
    console.log(`=== ENV: ${process.env.NODE_ENV}`);
    console.log(`=== Service: Streaming Preprocess`);
    console.log(`🚀 App listening on the port ${port}`);
  });
};

bootstrap();
