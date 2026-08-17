# syntax=docker/dockerfile:1

# --- base -------------------------------------------------------------------
# Expo SDK 56 requires Node 20+.
FROM node:20-bookworm-slim AS base
WORKDIR /app
ENV NODE_ENV=development \
    EXPO_NO_TELEMETRY=1
# git is used by some Expo/Metro tooling paths.
RUN apt-get update \
  && apt-get install -y --no-install-recommends git \
  && rm -rf /var/lib/apt/lists/*

# --- deps -------------------------------------------------------------------
# Installs dependencies against the container's Linux environment. These live
# in a named volume at runtime so the host's node_modules never leak in.
FROM base AS deps
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

# --- dev --------------------------------------------------------------------
# Used by docker-compose (target: dev). Serves the Expo web client with hot
# reload. Source is bind-mounted at runtime.
FROM deps AS dev
COPY . .
# `--host lan` makes Metro bind 0.0.0.0 so the published port is reachable. The
# hostname Metro advertises to the browser (for the HMR websocket) comes from
# REACT_NATIVE_PACKAGER_HOSTNAME, which compose sets to `localhost` — without it
# Metro would advertise the container's bridge IP and hot reload would fail.
EXPOSE 8081
CMD ["npx", "expo", "start", "--web", "--port", "8081", "--host", "lan"]

# --- build ------------------------------------------------------------------
# Exports a static web bundle to dist/ for production hosting.
FROM deps AS build
# EXPO_PUBLIC_* values are inlined into the bundle at export time, so the API
# URL has to be known here rather than at container start.
ARG EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
ENV EXPO_PUBLIC_API_BASE_URL=${EXPO_PUBLIC_API_BASE_URL}
COPY . .
RUN npx expo export --platform web

# --- prod -------------------------------------------------------------------
# Serves the exported static bundle with a lightweight static file server.
FROM node:20-bookworm-slim AS prod
WORKDIR /app
ENV NODE_ENV=production
RUN --mount=type=cache,target=/root/.npm npm install -g serve@14
COPY --from=build --chown=node:node /app/dist ./dist
USER node
EXPOSE 8081
CMD ["serve", "-s", "dist", "-l", "8081"]
