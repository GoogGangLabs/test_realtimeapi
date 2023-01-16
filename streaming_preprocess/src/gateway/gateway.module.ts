import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import StreamGateway from '@gateway/stream.gateway';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'STREAM_SERVICE',
        transport: Transport.REDIS,
        options: {
          host: process.env.REDIS_HOST,
          port: parseInt(process.env.REDIS_PORT, 10),
        },
      },
    ]),
  ],
  providers: [StreamGateway],
})
class GatewayModule {}

export default GatewayModule;
