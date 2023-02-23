from __future__ import print_function

import grpc

import inference_pb2
import inference_pb2_grpc

def run():
  channel = grpc.insecure_channel('localhost:50051')
  stub = inference_pb2_grpc.InferenceStub(channel)
  response = stub.InputStream(inference_pb2.StreamRequest(
    sessionId='123',
    sequence=1,
    startedAt=2,
    frame=b'\x00\x01\x02\x03',
    timestamp=[1],
    step=[2]
  ))
  print("Inference client received: " + response.message)

if __name__ == '__main__':
  run()