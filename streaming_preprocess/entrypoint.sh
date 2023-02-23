OUTPUT_PATH="./node_modules"

./node_modules/.bin/grpc_tools_node_protoc \
  --plugin="protoc-gen-ts=./node_modules/.bin/protoc-gen-ts" \
  --proto_path=../grpc \
  --js_out=import_style=commonjs,binary:src/generated \
  --ts_out="service=grpc-node:src/generated" \
  --grpc_out=grpc_js:src/generated ../grpc/inference.proto