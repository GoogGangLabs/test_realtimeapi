import os
import json
import asyncio
import pika

import holistic

SUB_QUEUE = os.environ.get('RABBITMQ_PRE_QUEUE')
PUB_EXCHANGE = os.environ.get('RABBITMQ_POST_EXCHANGE')

host = os.environ.get('RABBITMQ_HOST')
port = os.environ.get('RABBITMQ_PORT')
username = os.environ.get('RABBITMQ_USERNAME')
password = os.environ.get('RABBITMQ_PASSWORD')

credentials = pika.PlainCredentials(username=username, password=password)
connection = pika.BlockingConnection(pika.ConnectionParameters(host=host, port=port, credentials=credentials))
channel = connection.channel()

def pipeline():
  channel.queue_declare(queue=SUB_QUEUE, durable=True, auto_delete=False)
  channel.exchange_declare(exchange=PUB_EXCHANGE, exchange_type='fanout', durable=True, auto_delete=False)
  channel.basic_consume(queue=SUB_QUEUE, on_message_callback=subscribe, auto_ack=True)
  channel.start_consuming()

def subscribe(_, __, ___, body):
  asyncio.run(publish(body))

async def publish(message):
  data = eval(message)
  result = holistic.process(data['frame'])
  dict = { 'sessionId': data['sessionId'], 'result': result }
  channel.basic_publish(exchange=PUB_EXCHANGE, routing_key='', body=json.dumps(dict).encode())

if __name__ == '__main__':
  pipeline()