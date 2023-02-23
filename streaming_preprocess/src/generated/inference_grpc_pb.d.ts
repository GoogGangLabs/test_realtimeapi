// GENERATED CODE -- DO NOT EDIT!

// package: inference
// file: inference.proto

import * as inference_pb from "./inference_pb";
import * as grpc from "@grpc/grpc-js";

interface IInferenceService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
  inputStream: grpc.MethodDefinition<inference_pb.StreamRequest, inference_pb.InferenceResponse>;
  sayHello: grpc.MethodDefinition<inference_pb.HelloRequest, inference_pb.HelloReply>;
}

export const InferenceService: IInferenceService;

export interface IInferenceServer extends grpc.UntypedServiceImplementation {
  inputStream: grpc.handleUnaryCall<inference_pb.StreamRequest, inference_pb.InferenceResponse>;
  sayHello: grpc.handleUnaryCall<inference_pb.HelloRequest, inference_pb.HelloReply>;
}

export class InferenceClient extends grpc.Client {
  constructor(address: string, credentials: grpc.ChannelCredentials, options?: object);
  inputStream(argument: inference_pb.StreamRequest, callback: grpc.requestCallback<inference_pb.InferenceResponse>): grpc.ClientUnaryCall;
  inputStream(argument: inference_pb.StreamRequest, metadataOrOptions: grpc.Metadata | grpc.CallOptions | null, callback: grpc.requestCallback<inference_pb.InferenceResponse>): grpc.ClientUnaryCall;
  inputStream(argument: inference_pb.StreamRequest, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<inference_pb.InferenceResponse>): grpc.ClientUnaryCall;
  sayHello(argument: inference_pb.HelloRequest, callback: grpc.requestCallback<inference_pb.HelloReply>): grpc.ClientUnaryCall;
  sayHello(argument: inference_pb.HelloRequest, metadataOrOptions: grpc.Metadata | grpc.CallOptions | null, callback: grpc.requestCallback<inference_pb.HelloReply>): grpc.ClientUnaryCall;
  sayHello(argument: inference_pb.HelloRequest, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<inference_pb.HelloReply>): grpc.ClientUnaryCall;
}
