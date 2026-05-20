# ---- Stage 1: install dependencies ----
FROM oven/bun:1-slim AS deps

WORKDIR /app

COPY package.json bun.lock* ./
COPY src/pyon/package.json src/pyon/package.json

RUN bun install --frozen-lockfile --production

# ---- Stage 2: runtime ----
FROM oven/bun:1-slim

WORKDIR /app

RUN groupadd -r pyonpyon && \
    useradd -r -g pyonpyon -s /bin/false pyonpyon

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./
COPY src/ ./src/
RUN rm -rf src/pyon/node_modules && ln -s ../../node_modules src/pyon/node_modules

USER pyonpyon

CMD ["bun", "src/index.ts"]
