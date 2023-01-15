# import threading
import redis
import json

import hands

conn = redis.Redis(host='localhost', port=6379, db=0)

def pipeline():
  subscribe(conn.pubsub())

def subscribe(subscriber):
  subscriber.subscribe('STREAM_PREPROCESS')

  while True:
    message = subscriber.get_message()
    if message is not None and message['type'] == 'message':
      publish(message['data'].decode())
      # threading.Thread(target=publish, args=(message['data'].decode())).start()

def publish(message):
  data = eval(message)
  result = hands.process(data['data']['frame'])
  dict = {'sessionId': data['data']['sessionId'], 'result': result}
  conn.publish(channel='STREAM_POSTPROCESS', message=json.dumps(dict).encode())

if __name__ == '__main__':
  pipeline()