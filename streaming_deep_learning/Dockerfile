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

COPY ./grpc/* ./

CMD [ "python3", "-u", "main.py" ]

ENTRYPOINT [ "sh", "entrypoint.sh"]