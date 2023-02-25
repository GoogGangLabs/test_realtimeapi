#!/bin/bash

OUTPUT_PATH="./node_modules/@grpc/inference"

if [ ! -d "$OUTPUT_PATH" ]; then
    mkdir -p $OUTPUT_PATH
fi

./node_modules/.bin/grpc_tools_node_protoc \
    --plugin="protoc-gen-ts=./node_modules/.bin/protoc-gen-ts" \
    --proto_path=$PROTO_PATH \
    --js_out=import_style=commonjs,binary:$OUTPUT_PATH \
    --ts_out="service=grpc-node:$OUTPUT_PATH" \
    --grpc_out=grpc_js:$OUTPUT_PATH $PROTO_PATH/inference.proto

yarn build && yarn deploy
