ARG NODE_VERSION=18.18.2
FROM node:${NODE_VERSION}-alpine

WORKDIR /app
COPY . .
RUN yarn install

EXPOSE 4000

CMD yarn start
