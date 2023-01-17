import os
import redis
import json

import holistic

host = os.environ.get('REDIS_HOST') if os.environ.get('REDIS_HOST') is not None else 'localhost'
port = int(os.environ.get('REDIS_PORT')) if os.environ.get('REDIS_PORT') is not None else 6379

conn = redis.Redis(host, port, db=0)

def pipeline():
  subscribe(conn.pubsub())

def subscribe(subscriber):
  subscriber.subscribe('STREAM_PREPROCESS')

  while True:
    message = subscriber.get_message()
    if message is not None and message['type'] == 'message':
      publish(message['data'].decode())

def publish(message):
  data = eval(message)
  result = holistic.process(data['data']['frame'])
  dict = {'sessionId': data['data']['sessionId'], 'result': result}
  conn.publish(channel='STREAM_POSTPROCESS', message=json.dumps(dict).encode())

if __name__ == '__main__':
  pipeline()