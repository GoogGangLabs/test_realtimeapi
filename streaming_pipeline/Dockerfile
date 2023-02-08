FROM rabbitmq:3.11.8-management-alpine

WORKDIR /usr/local/app

COPY rabbitmq.conf /etc/rabbitmq/
COPY definitions.json /etc/rabbitmq/
COPY entrypoint.sh hashing.py ./

ENTRYPOINT [ "sh", "./entrypoint.sh" ]
