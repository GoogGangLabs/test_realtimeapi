#!/usr/sh

HASHED_PASSWORD=$(python hashing.py)

sed -i 's/\"PASSWORD\"/$HASHED_PASSWORD/g' /etc/rabbitmq/definitions.json

rabbitmq-server