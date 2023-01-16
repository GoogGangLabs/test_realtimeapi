FROM alpine:3.17

RUN mkdir -p /usr/local/app
WORKDIR /usr/local/app
COPY . .

RUN apk update && apk add nodejs-lts
RUN npm install -g pm2 yarn
RUN yarn
