FROM node:20-alpine

WORKDIR /app

# Install dependencies
RUN apk add --no-cache libc6-compat

COPY package.json ./
RUN npm install

COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the application
RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]
