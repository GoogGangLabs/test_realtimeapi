#!/bin/sh

PASSWORD_HASH=$(python hashing.py)

sed -i "s|PASSWORD_HASH|$PASSWORD_HASH|g" /etc/rabbitmq/definitions.json

rabbitmq-server 1> /dev/null