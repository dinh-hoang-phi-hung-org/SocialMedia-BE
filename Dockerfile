# ===== BUILD STAGE =====
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build


# ===== PRODUCTION STAGE =====
FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache dumb-init

COPY package*.json ./

# chỉ install production deps
RUN npm ci --omit=dev

# copy build output
COPY --from=builder /app/dist ./dist

EXPOSE 3001

ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "dist/main.js"]