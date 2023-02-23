// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var inference_pb = require('./inference_pb.js');

function serialize_inference_HelloReply(arg) {
  if (!(arg instanceof inference_pb.HelloReply)) {
    throw new Error('Expected argument of type inference.HelloReply');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_inference_HelloReply(buffer_arg) {
  return inference_pb.HelloReply.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_inference_HelloRequest(arg) {
  if (!(arg instanceof inference_pb.HelloRequest)) {
    throw new Error('Expected argument of type inference.HelloRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_inference_HelloRequest(buffer_arg) {
  return inference_pb.HelloRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_inference_InferenceResponse(arg) {
  if (!(arg instanceof inference_pb.InferenceResponse)) {
    throw new Error('Expected argument of type inference.InferenceResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_inference_InferenceResponse(buffer_arg) {
  return inference_pb.InferenceResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_inference_StreamRequest(arg) {
  if (!(arg instanceof inference_pb.StreamRequest)) {
    throw new Error('Expected argument of type inference.StreamRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_inference_StreamRequest(buffer_arg) {
  return inference_pb.StreamRequest.deserializeBinary(new Uint8Array(buffer_arg));
}


var InferenceService = exports.InferenceService = {
  inputStream: {
    path: '/inference.Inference/InputStream',
    requestStream: false,
    responseStream: false,
    requestType: inference_pb.StreamRequest,
    responseType: inference_pb.InferenceResponse,
    requestSerialize: serialize_inference_StreamRequest,
    requestDeserialize: deserialize_inference_StreamRequest,
    responseSerialize: serialize_inference_InferenceResponse,
    responseDeserialize: deserialize_inference_InferenceResponse,
  },
  sayHello: {
    path: '/inference.Inference/SayHello',
    requestStream: false,
    responseStream: false,
    requestType: inference_pb.HelloRequest,
    responseType: inference_pb.HelloReply,
    requestSerialize: serialize_inference_HelloRequest,
    requestDeserialize: deserialize_inference_HelloRequest,
    responseSerialize: serialize_inference_HelloReply,
    responseDeserialize: deserialize_inference_HelloReply,
  },
};

exports.InferenceClient = grpc.makeGenericClientConstructor(InferenceService);
