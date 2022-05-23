FROM node:18-buster-slim

WORKDIR /usr/src/app

COPY * ./
COPY src ./src/

RUN yarn
RUN yarn build
EXPOSE 8080

CMD [ "yarn", "start" ]
