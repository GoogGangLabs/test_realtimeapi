FROM ubuntu:22.04

ENV REDIS_HOST ${REDIS_HOST} \
    REDIS_PORT ${REDIS_PORT}

RUN mkdir -p /usr/local/app
WORKDIR /usr/local/app
COPY . .

RUN apt update && apt install -y --no-install-recommends \
        python3 \
        python3-pip \
        python3-opencv

RUN pip3 install -r requirements.txt

ENTRYPOINT [ "python3", "main.py" ]
