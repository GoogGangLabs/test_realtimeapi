import os
import json
import asyncio
import aio_pika

import holistic

SUB_QUEUE = os.environ.get('RABBITMQ_PRE_QUEUE')
PUB_EXCHANGE = os.environ.get('RABBITMQ_POST_EXCHANGE')

host = os.environ.get('RABBITMQ_HOST')
port = os.environ.get('RABBITMQ_PORT')
username = os.environ.get('RABBITMQ_USERNAME')
password = os.environ.get('RABBITMQ_PASSWORD')

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

  async with queue.iterator() as queue_iter:
    async for message in queue_iter:
      async with message.process():
        data = json.loads(message.body.decode())
        result = holistic.process(data['sequence'], data['frame'])
        dict = { 'sessionId': data['sessionId'], 'sequence': data['sequence'], 'result': result }
        await exchange.publish(aio_pika.Message(json.dumps(dict).encode()), routing_key='')

if __name__ == '__main__':
  loop = asyncio.get_event_loop()
  loop.create_task(pipeline(loop))
  loop.run_forever()