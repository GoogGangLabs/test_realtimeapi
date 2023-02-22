import os
import json
import cv2
import numpy
import mediapipe as mp
import pika
import time
import math

from concurrent import futures

import grpc
import inference_pb2
import inference_pb2_grpc

PUB_EXCHANGE = 'postprocess_exchange'

host = 'localhost'
port = 5672
username = 'ggl'
password = 'goodganglabs1234'

credentials = pika.PlainCredentials(username=username, password=password)
connection = pika.BlockingConnection(pika.ConnectionParameters(host=host, port=port, credentials=credentials))
channel = connection.channel()
channel.exchange_declare(exchange=PUB_EXCHANGE, exchange_type='fanout', durable=True, auto_delete=False)

mp_holistic = mp.solutions.holistic
holistic = mp_holistic.Holistic(min_detection_confidence=0.5, min_tracking_confidence=0.5)

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

  def InputStream(self, request, context):
    
    checkTime(request['timestamp'], request['step'])
    
    np_data = numpy.asarray(request['frame']['data'], numpy.uint8)
    image = cv2.imdecode(np_data, cv2.IMREAD_COLOR)
    result = holistic.process(image[..., ::-1])
    resultJSON = {
      'left_hand': get_landmark_list(result.left_hand_landmarks),
      'right_hand': get_landmark_list(result.right_hand_landmarks),
      'pose': get_landmark_list(result.pose_landmarks),
      'face': get_landmark_list(result.face_landmarks)
    }

    checkTime(request['timestamp'], request['step'])

    dict = {
      'sessionId': request['sessionId'],
      'sequence': request['sequence'],
      'result': resultJSON,
      'startedAt': request['startedAt'],
      'timestamp': request['timestamp'],
      'step': request['step']
    }

    channel.basic_publish(exchange=PUB_EXCHANGE, routing_key='', body=json.dumps(dict).encode())

    return inference_pb2.InferenceResponse()

def serve():
  server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
  inference_pb2_grpc.add_InferenceServicer_to_server(Inference(), server)

  server.add_insecure_port('[::]:8000')
  server.start()
  server.wait_for_termination()

if __name__ == '__main__':
  serve()
