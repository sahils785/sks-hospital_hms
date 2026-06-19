FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --only=production || npm install

COPY . .

# Generate Prisma Client (explicit schema path)
RUN npx prisma generate --schema=src/prisma/schema.prisma

# Build TypeScript
RUN npm run build

EXPOSE 8080

CMD ["npm", "start"]
