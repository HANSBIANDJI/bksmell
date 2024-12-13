FROM node:18-alpine

WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

# Copy package files and prisma schema first
COPY package*.json ./
COPY prisma ./prisma/
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY src ./src

# Build TypeScript
RUN npm run build

# Clean up development dependencies
RUN npm prune --production

# Expose port
EXPOSE 3008

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3008/health || exit 1

# Start the server
CMD ["npm", "start"]
