#!/bin/bash

python3 -m grpc_tools.protoc -I../grpc --python_out=. --grpc_python_out=. ../grpc/inference.proto

exec $@