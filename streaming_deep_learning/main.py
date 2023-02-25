import os
import json
import cv2
import numpy
import mediapipe as mp
import time
import math
import base64
import zlib
import redis

from concurrent import futures

import grpc
import inference_pb2
import inference_pb2_grpc

host = os.environ.get('REDIS_HOST')
port = os.environ.get('REDIS_PORT')

conn = redis.Redis(host, port, db=0)

mp_holistic = mp.solutions.holistic

def get_landmark_list(landmarks):
  landmark_list = []

  if landmarks is None:
    return landmark_list

  for _, landmark in enumerate(landmarks.landmark):
    element = {}
    element['x'] = landmark.x
    element['y'] = landmark.y
    element['z'] = landmark.z

    if landmark.visibility > 0.0:
      element['visibility'] = landmark.visibility

    landmark_list.append(element)

  return landmark_list

def checkTime(timestamp, step):
  serverTime = math.floor(time.time() * 1000)
  step.append(serverTime - timestamp[-1])
  timestamp.append(serverTime)

class Inference(inference_pb2_grpc.InferenceServicer):

  holistic = mp_holistic.Holistic(min_detection_confidence=0.5, min_tracking_confidence=0.5)

  def InputStream(self, request: inference_pb2.StreamRequest, context) -> inference_pb2.InferenceResponse:

    if (request.sequence > 5000):
      return
    checkTime(request.timestamp, request.step)

    start = time.time()
    base64Data = zlib.decompress(request.image)
    buffer = base64.b64decode(base64Data)
    np_data = numpy.frombuffer(buffer, numpy.uint8)
    image = cv2.imdecode(np_data, cv2.IMREAD_COLOR)
    end1 = time.time() - start
    start = time.time()
    result = self.holistic.process(image[..., ::-1])
    end2 = time.time() - start
    print(f"{request.sequence} - 이미지 처리: {math.floor(end1 * 1000)}ms, 이미지 추론: {math.floor(end2 * 1000)}ms")

    resultJSON = {
      'left_hand': get_landmark_list(result.left_hand_landmarks),
      'right_hand': get_landmark_list(result.right_hand_landmarks),
      'pose': get_landmark_list(result.pose_landmarks),
      'face': get_landmark_list(result.face_landmarks)
    }

    checkTime(request.timestamp, request.step)

    dict = {
      'sessionId': request.sessionId,
      'sequence': request.sequence,
      'result': resultJSON,
      'startedAt': request.startedAt,
      'timestamp': list(request.timestamp),
      'step': list(request.step)
    }

    conn.publish(channel='STREAM_POSTPROCESS', message=json.dumps(dict).encode())

    return inference_pb2.InferenceResponse(status=200)

def serve():
  server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
  inference_pb2_grpc.add_InferenceServicer_to_server(Inference(), server)

  server.add_insecure_port('[::]:50051')
  server.start()
  server.wait_for_termination()

if __name__ == '__main__':
  serve()
