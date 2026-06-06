# ---- Stage 1: Build standalone executable ----
FROM oven/bun:1-alpine AS builder

WORKDIR /app

COPY package.json bun.lock* ./
COPY src/pyon/package.json src/pyon/package.json
# No --frozen-lockfile: lockfile was generated on Windows, Alpine needs musl platform packages
RUN bun install --production

COPY src/ ./src/
RUN rm -rf src/pyon/node_modules && ln -s ../../node_modules src/pyon/node_modules

# Copy the musl native addon into the source tree so Bun embeds it directly
RUN find /app -name "resvgjs.linux-x64-musl.node" -exec \
    cp {} /app/src/pyon/src/resvgjs.linux-x64-musl.node \;

RUN bun build --compile --minify --bytecode \
    --compile-exec-argv="--smol" \
    --define __COMPILED__=true \
    ./src/index.ts \
    --outfile pyonpyon

# ---- Stage 2: Minimal runtime ----
FROM alpine:3.21

RUN apk add --no-cache ca-certificates libstdc++

COPY --from=builder /app/pyonpyon /app/pyonpyon

USER nobody

ENTRYPOINT ["/app/pyonpyon"]
