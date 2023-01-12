import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

import AppModule from '@src/app.module';

const bootstrap = async () => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const port = process.env.PORT || 3000;

  app.useStaticAssets(join(__dirname, '/..', '/public'));
  app.setBaseViewsDir(join(__dirname, '/..', '/public'));
  app.setViewEngine('ejs');

  await app.listen(port, () => {
    console.log(`======= ENV: ${process.env.NODE_ENV}`);
    console.log(`======= Service: Streaming Request`);
    console.log(`🚀 App listening on the port ${port}`);
  });
};

bootstrap();
