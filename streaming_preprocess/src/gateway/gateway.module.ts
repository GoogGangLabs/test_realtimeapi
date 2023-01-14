import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import StreamGateway from '@gateway/stream.gateway';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'STREAM_PREPROCESS',
        transport: Transport.REDIS,
        options: {
          host: 'localhost',
          port: 6379,
        },
      },
    ]),
  ],
  providers: [StreamGateway],
})
class GatewayModule {}

export default GatewayModule;
