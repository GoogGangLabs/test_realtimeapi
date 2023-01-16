FROM alpine:3.17

RUN mkdir -p /usr/local/app
WORKDIR /usr/local/app
COPY package.json yarn.lock ./

RUN echo "CLIENT_HOST=${CLIENT_HOST}\nREDIS_HOST=${REDIS_HOST}\nREDIS_PORT=${REDIS_PORT}" > .env.prod

RUN apk update && apk add nodejs-lts npm
RUN npm install -g pm2 yarn

RUN yarn
COPY . .
RUN yarn build

ENTRYPOINT [ "yarn", "deploy" ]