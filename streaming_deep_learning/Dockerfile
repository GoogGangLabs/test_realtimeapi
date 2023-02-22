FROM ubuntu:22.04

RUN mkdir -p /usr/local/app
WORKDIR /usr/local/app

RUN apt update && apt install -y --no-install-recommends \
        python3 \
        python3-pip \
        python3-opencv

RUN python3 -m pip install grpcio-tools

COPY ./grpc/requirements.txt ./
RUN pip3 install -r requirements.txt

COPY ./grpc/main.py ./grpc/inference.proto ./
RUN python3 -m grpc_tools.protoc -I. --python_out=. --grpc_python_out=. ./inference.proto

ENTRYPOINT [ "python3", "-u", "main.py" ]
