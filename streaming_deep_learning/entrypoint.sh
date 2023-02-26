#!/bin/bash

python3 -m grpc_tools.protoc -I$PROTO_PATH \
    --python_out=. \
    --grpc_python_out=. \
    $PROTO_PATH/inference.proto \
    $PROTO_PATH/result.proto

source venv/bin/activate && python -u main.py