import { Module } from '@nestjs/common';

import GrpcService from '@service/grpc.service';
import LatencyService from '@service/latency.service';

@Module({ providers: [ GrpcService, LatencyService ] })
class ServiceModule {}

export default ServiceModule;
