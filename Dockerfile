# ===== BUILD STAGE =====
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build:prod


# ===== PRODUCTION STAGE =====
FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache dumb-init wget

COPY package*.json ./

RUN npm ci --omit=dev

COPY --from=builder /app/node_modules/ts-node ./node_modules/ts-node
COPY --from=builder /app/node_modules/typescript ./node_modules/typescript
COPY --from=builder /app/node_modules/tsconfig-paths ./node_modules/tsconfig-paths
COPY --from=builder /app/node_modules/json5 ./node_modules/json5

# Runtime build
COPY --from=builder /app/dist ./dist

# Copy config + migrations
COPY typeorm.config.ts ./dist/typeorm.config.ts
COPY tsconfig.json ./tsconfig.json
COPY src/shared/infrastructure/database/migrations ./src/shared/infrastructure/database/migrations

EXPOSE 3001

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
