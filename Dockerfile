# ---- Stage 1: install dependencies ----
FROM oven/bun:1-slim AS deps

WORKDIR /app

COPY package.json bun.lock* ./
COPY src/pyon/package.json src/pyon/package.json

RUN bun install --frozen-lockfile --production

# ---- Stage 2: runtime ----
FROM oven/bun:1-slim

WORKDIR /app

RUN addgroup --system pyonpyon && \
    adduser --system --ingroup pyonpyon pyonpyon

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./
COPY src/ ./src/

USER pyonpyon

CMD ["bun", "src/index.ts"]
