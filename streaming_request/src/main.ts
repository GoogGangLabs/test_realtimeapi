import { NestFactory } from '@nestjs/core';
import AppModule from '@src/app.module';

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3000;

  await app.listen(port, () => {
    console.log(`======= ENV: ${process.env.NODE_ENV} =======`);
    console.log(`======= Service: Streaming Request =========`);
    console.log(`🚀 App listening on the port ${port}`);
  });
};

bootstrap();
