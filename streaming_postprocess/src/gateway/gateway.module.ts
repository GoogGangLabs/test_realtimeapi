import { Module } from '@nestjs/common';

import StreamGateway from '@gateway/stream.gateway';

@Module({
  providers: [StreamGateway],
})
class GatewayModule {}

export default GatewayModule;
