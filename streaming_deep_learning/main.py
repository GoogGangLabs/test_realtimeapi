import os
import json
import cv2
import numpy
import mediapipe as mp
import time
import math
import base64
import zlib

from concurrent import futures

from google.protobuf.json_format import ParseDict
import grpc
import result_pb2
import inference_pb2
import inference_pb2_grpc

mp_holistic = mp.solutions.holistic

def get_landmark_list(landmarks):
  landmark_list = []

  if landmarks is None:
    return landmark_list

  for _, landmark in enumerate(landmarks.landmark):
    element = result_pb2.LandmarkResult()
    element.x = landmark.x
    element.y = landmark.y
    element.z = landmark.z

    landmark_list.append(element)

  return landmark_list

def get_landmark_visibility_list(landmarks):
  landmark_list = []

  if landmarks is None:
    return landmark_list

  for _, landmark in enumerate(landmarks.landmark):
    element = result_pb2.LandmarkVisibilityResult()
    element.x = landmark.x
    element.y = landmark.y
    element.z = landmark.z
    element.visibility = landmark.visibility

    landmark_list.append(element)

  return landmark_list

def checkTime(timestamp, step):
  serverTime = math.floor(time.time() * 1000)
  step.append(serverTime - timestamp[-1])
  timestamp.append(serverTime)

class Inference(inference_pb2_grpc.InferenceServicer):

  holistic = mp_holistic.Holistic(
    min_tracking_confidence=0.2,
    refineFaceLandmarks=True
  )

  def InputStream(self, request: inference_pb2.StreamRequest, _) -> inference_pb2.InferenceResponse:

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

    start = time.time()
    inferenceResult = result_pb2.InferenceResult(
      face=get_landmark_list(result.face_landmarks),
      left_hand=get_landmark_list(result.left_hand_landmarks),
      right_hand=get_landmark_list(result.right_hand_landmarks),
      pose=get_landmark_visibility_list(result.pose_landmarks),
      pose_world=get_landmark_visibility_list(result.pose_world_landmarks)
    )
    end3 = time.time() - start
    print(f"{request.sequence} - 복원: {math.floor(end1 * 1000)}ms, 추론: {math.floor(end2 * 1000)}ms, 취합: {math.floor(end3 * 1000)}ms")

    checkTime(request.timestamp, request.step)

    return inference_pb2.InferenceResponse(
      sessionId=request.sessionId,
      sequence=request.sequence,
      startedAt=request.startedAt,
      timestamp=request.timestamp,
      step=request.step,
      result=inferenceResult
    )

def serve():
  server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
  inference_pb2_grpc.add_InferenceServicer_to_server(Inference(), server)

  server.add_insecure_port('[::]:50051')
  server.start()
  server.wait_for_termination()

if __name__ == '__main__':
  serve()
