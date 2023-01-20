FROM alpine:3.17

RUN mkdir -p /usr/local/app
WORKDIR /usr/local/app


RUN apk update && \
    apk add nodejs-lts npm && \
    npm install -g pm2 yarn

COPY package.json yarn.lock ./
RUN yarn

COPY . .
RUN yarn build

RUN echo "REDIS_HOST=${REDIS_HOST}\nREDIS_PORT=${REDIS_PORT}" > .env.prod

ENTRYPOINT [ "yarn", "deploy" ]