# Stage 1: Install dependencies
FROM node:20-bookworm AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY prisma ./prisma/
RUN npm install

# Stage 2: Build the application
FROM node:20-bookworm AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js
RUN npm run build

# Stage 3: Runner
FROM node:20-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy necessary files from builder
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

# Install openssl for Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

EXPOSE 3000

CMD ["node", "server.js"]
