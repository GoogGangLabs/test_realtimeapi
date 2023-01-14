import { Module } from '@nestjs/common';

import ControllerModule from '@controller/controller.module';
import GatewayModule from '@gateway/gateway.module';

@Module({
  imports: [ControllerModule, GatewayModule],
})
class AppModule {}

export default AppModule;
