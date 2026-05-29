# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies for compiling better-sqlite3
RUN apk add --no-cache python3 make g++ sqlite-dev

# Optimization: Copy only dependency files first
COPY package*.json ./

RUN npm ci

# Copy source code and build
COPY tsconfig.json ./
COPY src ./src

RUN npm run build

# Remove development dependencies to keep production node_modules clean
RUN npm prune --production

# Stage 2: Production
FROM node:20-alpine AS production

LABEL maintainer="Senior TypeScript Developer"
LABEL version="1.0.0"

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 appgroup && \
    adduser -u 1001 -G appgroup -s /bin/sh -D appuser

# Copy production node_modules and compiled assets from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package*.json ./

# Create directory for SQLite data and set permissions
RUN mkdir -p /app/data && chown -R appuser:appgroup /app/data

USER appuser

ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_PATH=/app/data/calorie-tracker.db

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "dist/server.js"]
