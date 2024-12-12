FROM node:18-slim as builder

# Set working directory
WORKDIR /app/backend

# Install curl for healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy package files first for better caching
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source code and prisma schema
COPY src ./src/
COPY prisma ./prisma/

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript code
RUN npm run build

# Production stage
FROM node:18-slim

WORKDIR /app/backend

# Install curl for healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy built files and dependencies from builder
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/package*.json ./
COPY --from=builder /app/backend/prisma ./prisma

# Environment and port configuration
ENV PORT=3000
ENV NODE_ENV=production

# Expose port
EXPOSE $PORT

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:$PORT/health || exit 1

# Start the application
CMD ["npm", "start"]
