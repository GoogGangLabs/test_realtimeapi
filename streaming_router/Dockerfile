FROM alpine:3.17

RUN apk update && apk add nginx

COPY server.conf /etc/nginx/http.d/

ENTRYPOINT [ "nginx", "-g", "daemon off;" ]
