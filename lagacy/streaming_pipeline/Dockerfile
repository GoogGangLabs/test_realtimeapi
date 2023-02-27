FROM rabbitmq:3.11.8-management-alpine

WORKDIR /usr/local/app

RUN apk update && apk add curl

COPY rabbitmq.conf definitions.json /etc/rabbitmq/
COPY entrypoint.sh hashing.py ./

ENTRYPOINT [ "sh", "./entrypoint.sh" ]
