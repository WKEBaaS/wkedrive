FROM node:24-alpine AS base

FROM base AS builder
WORKDIR /app

# Install pnpm first (better caching)
RUN npm i -g pnpm

# Copy only dependency files first for better layer caching
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build application
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN pnpm run build

# Prune dev dependencies (uncomment if you need node_modules in production)
# RUN pnpm prune --prod

FROM base AS production
WORKDIR /app

# Install pnpm in production image (only if you need it)
RUN npm i -g pnpm

# Copy built application
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./

# If you need production dependencies, uncomment:
# COPY --from=builder /app/node_modules ./node_modules

# Use non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000
ENV NODE_ENV=production

CMD ["node", "build"]
