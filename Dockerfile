FROM node:22.14.0-bookworm-slim

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV CHROME_BIN="/usr/bin/chromium"

RUN corepack enable \
  && corepack prepare pnpm@10.12.1 --activate \
  && apt-get update \
  && apt-get install --yes --no-install-recommends chromium \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json pnpm-lock.yaml .npmrc ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN chown -R node:node /app

USER node

EXPOSE 3000

CMD ["pnpm", "dev"]
