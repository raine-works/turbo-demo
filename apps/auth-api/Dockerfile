# base node image
FROM node:16.13-alpine AS base

RUN apk update
RUN apk add git

WORKDIR /app

ENV YARN_CACHE_FOLDER=.yarn-cache

# sourcer
FROM base AS sourcer

RUN yarn global add turbo
COPY . .
RUN turbo prune --scope=auth-api --docker

# deps
FROM base AS deps

COPY --from=sourcer /app/out/json/ .
COPY --from=sourcer /app/out/yarn.lock ./yarn.lock

RUN yarn install

# prod deps
FROM base AS prod-deps

COPY --from=sourcer /app/out/json/ .
COPY --from=sourcer /app/out/yarn.lock ./yarn.lock
COPY --from=deps /app/ .

RUN yarn install --production --ignore-scripts --prefer-offline

RUN yarn cache clean

# builder
FROM base AS builder

COPY --from=deps /app/ .
COPY --from=sourcer /app/out/full/ .

RUN yarn turbo run build --include-dependencies

# runtime
FROM base

ENV NODE_ENV=production
ENV PORT=8000

EXPOSE 8000

COPY --from=prod-deps /app/ .

WORKDIR /app/apps/auth-api

# Copy application build
COPY --from=builder /app/apps/auth-api/.build ./.build

# Copy required local packages
COPY --from=builder /app/node_modules/data-models ./node_modules/data-models
COPY --from=builder /app/node_modules/req-schema ./node_modules/req-schema

CMD ["yarn", "start"]