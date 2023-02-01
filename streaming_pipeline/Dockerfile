FROM alpine:3.17

RUN mkdir -p /etc/rabbitmq

RUN echo @repository http://nl.alpinelinux.org/alpine/edge/testing >> /etc/apk/repositories && \
    apk update && \
    apk add bash rabbitmq-server@repository

COPY rabbitmq.conf /etc/rabbitmq
COPY definitions.json /etc/rabbitmq

CMD [ "rabbitmq-server" ]
