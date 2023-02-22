import { ClientOptions, Transport } from "@nestjs/microservices";
import { join } from "path";

const grpcClientOption: ClientOptions = {
  transport: Transport.GRPC,
  options: {
    url: 'localhost:8000',
    package: 'inference',
    protoPath: join(__dirname, '../../../grpc/inference.proto'),
  },
};

export default grpcClientOption;