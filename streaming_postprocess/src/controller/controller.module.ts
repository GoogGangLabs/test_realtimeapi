import { Module } from '@nestjs/common';
import RabbitMQController from '@controller/rabbitmq.controller';
import StreamGateway from '@gateway/stream.gateway';

@Module({
  controllers: [RabbitMQController],
  providers: [StreamGateway],
})
class ControllerModule {}

export default ControllerModule;
