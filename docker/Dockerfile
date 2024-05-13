# BASE
FROM node:18-alpine AS base

RUN apk add --no-cache tini

WORKDIR /app

COPY package*.json ./

# DEPENDENCIES
FROM base AS dependencies

RUN npm install --only=prod

# BUILDER
FROM base AS builder

RUN npm install -g @nestjs/cli
RUN npm install

COPY . .

#
FROM builder AS back-end
RUN nest build back-end

#
FROM builder AS bot
RUN nest build bot

#
FROM builder AS chat-mq
RUN nest build chat-mq

#
FROM builder AS youtube-channel-crawler
RUN nest build youtube-channel-crawler

# RELEASE
FROM base AS release

COPY docker/docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh

COPY --from=dependencies            /app/node_modules ./node_modules
COPY --from=back-end                /app/dist ./dist
COPY --from=bot                     /app/dist ./dist
COPY --from=chat-mq                 /app/dist ./dist
COPY --from=youtube-channel-crawler /app/dist ./dist

EXPOSE 8080

ENTRYPOINT /sbin/tini -- /bin/sh /docker-entrypoint.sh $0