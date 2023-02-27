import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { path } from 'app-root-path';

import ControllerModule from '@controller/controller.module';
import GatewayModule from '@gateway/gateway.module';
import ServiceModule from '@service/service.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `${path}/.env.${process.env.NODE_ENV}`,
    }),
    ControllerModule,
    GatewayModule,
    ServiceModule,
  ],
})
class AppModule {}

export default AppModule;
