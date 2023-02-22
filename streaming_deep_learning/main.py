import os
import json
import asyncio
import aio_pika
import cv2
import numpy
import mediapipe as mp
import time
import math

SUB_QUEUE = os.environ.get('RABBITMQ_PRE_QUEUE')
PUB_EXCHANGE = os.environ.get('RABBITMQ_POST_EXCHANGE')

host = os.environ.get('RABBITMQ_HOST')
port = os.environ.get('RABBITMQ_PORT')
username = os.environ.get('RABBITMQ_USERNAME')
password = os.environ.get('RABBITMQ_PASSWORD')

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

async def pipeline(loop):
  connection = await aio_pika.connect_robust(
    host=host,
    port=port,
    login=username,
    password=password,
    loop=loop
  )
  channel = await connection.channel()
  await channel.set_qos(prefetch_count=1)

  queue = await channel.declare_queue(SUB_QUEUE, durable=True)
  exchange = await channel.declare_exchange(PUB_EXCHANGE, type=aio_pika.ExchangeType.FANOUT, durable=True)

  mp_holistic = mp.solutions.holistic
  with mp_holistic.Holistic(
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5) as holistic:
    async with queue.iterator() as queue_iter:
      async for message in queue_iter:
        async with message.process():
          data = json.loads(message.body.decode())

          checkTime(data['timestamp'], data['step'])
          
          np_data = numpy.asarray(data['frame']['data'], numpy.uint8)
          image = cv2.imdecode(np_data, cv2.IMREAD_COLOR)
          result = holistic.process(image[..., ::-1])
          resultJSON = {
            'left_hand': get_landmark_list(result.left_hand_landmarks),
            'right_hand': get_landmark_list(result.right_hand_landmarks),
            'pose': get_landmark_list(result.pose_landmarks),
            'face': get_landmark_list(result.face_landmarks)
          }

          checkTime(data['timestamp'], data['step'])

          dict = {
            'sessionId': data['sessionId'],
            'sequence': data['sequence'],
            'result': resultJSON,
            'startedAt': data['startedAt'],
            'timestamp': data['timestamp'],
            'step': data['step']
          }
          await exchange.publish(aio_pika.Message(json.dumps(dict).encode()), routing_key='')

if __name__ == '__main__':
  loop = asyncio.get_event_loop()
  loop.create_task(pipeline(loop))
  loop.run_forever()
