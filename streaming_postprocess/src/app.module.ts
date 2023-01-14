import ControllerModule from '@controller/controller.module';
import GatewayModule from '@gateway/gateway.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [ControllerModule, GatewayModule],
})
class AppModule {}

export default AppModule;
