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
# in a named volume at runtime so the macOS host node_modules never leak in.
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# --- dev --------------------------------------------------------------------
# Used by docker-compose (target: dev). Serves the Expo web client with hot
# reload. Source is bind-mounted at runtime.
FROM deps AS dev
COPY . .
# Bind on all interfaces so Docker port publishing can reach Metro from the host.
# Default Expo host is localhost, which is unreachable via published ports.
EXPOSE 8081
CMD ["npx", "expo", "start", "--web", "--port", "8081", "--host", "lan"]

# --- build ------------------------------------------------------------------
# Exports a static web bundle to dist/ for production hosting.
FROM deps AS build
COPY . .
RUN npx expo export --platform web

# --- prod -------------------------------------------------------------------
# Serves the exported static bundle with a lightweight static file server.
FROM base AS prod
ENV NODE_ENV=production
RUN npm install -g serve@14
COPY --from=build /app/dist ./dist
EXPOSE 8081
CMD ["serve", "-s", "dist", "-l", "8081"]
