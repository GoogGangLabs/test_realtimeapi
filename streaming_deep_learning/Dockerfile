FROM ubuntu:22.04

RUN mkdir -p /usr/local/app
WORKDIR /usr/local/app

RUN apt update && apt install -y --no-install-recommends \
        python3 \
        python3-pip \
        python3-venv \
        python3-opencv

RUN python3 -m pip install grpcio-tools

SHELL ["/bin/bash", "-c"]

COPY requirements.txt ./
RUN python3 -m venv venv && \
    source venv/bin/activate && \
    pip install -r requirements.txt

COPY main.py entrypoint.sh ./

ENTRYPOINT [ "bash", "entrypoint.sh"]