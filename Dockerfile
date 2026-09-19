# =========================================================
# X Mart Convenience Store - Production Dockerfile
# Optimized multi-stage build with native SQLite compilation
# =========================================================

# Stage 1: Build & Native Dependencies
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies for better-sqlite3 native addon
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci --omit=dev

# Stage 2: Production Runner
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment defaults
ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0 \
    DATA_DIR=/data

# Create persistent data volume directory
RUN mkdir -p /data && chown -R node:node /data

# Copy production dependencies and application sources
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package*.json ./
COPY --chown=node:node src/ ./src/
COPY --chown=node:node public/ ./public/

# Use non-root node user for container security
USER node

# Expose cloud container port
EXPOSE 3000

# Mountable volume for SQLite persistence
VOLUME ["/data"]

# Container healthcheck for Cloud Load Balancers & Ingress
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

# Start production server
CMD ["node", "src/server.js"]
