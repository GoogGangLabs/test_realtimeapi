import { Module } from '@nestjs/common';
import ViewController from '@controller/view.controller';

@Module({
  controllers: [ViewController],
})
class ControllerModule {}

export default ControllerModule;
