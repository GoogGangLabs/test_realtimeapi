import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { path } from 'app-root-path';

import AppModule from '@src/app.module';

const bootstrap = async () => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const port = process.env.PORT || 3000;

  app.useStaticAssets(`${path}/public`);
  app.setBaseViewsDir(`${path}/public`);
  app.setViewEngine('ejs');

  await app.listen(port, () => {
    console.log(`=== ENV: ${process.env.NODE_ENV}`);
    console.log(`=== Service: Streaming Preprocess`);
    console.log(`🚀 App listening on the port ${port}`);
  });
};

bootstrap();
