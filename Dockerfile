FROM node:24-alpine AS builder

WORKDIR /usr/src/app

RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma

RUN npm ci

RUN npx prisma generate

COPY . .
RUN npm run build

RUN npm prune --omit=dev

FROM node:24-alpine AS production

WORKDIR /usr/src/app

RUN apk add --no-cache tini openssl

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

COPY --from=builder --chown=nestjs:nodejs /usr/src/app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /usr/src/app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /usr/src/app/package*.json ./
COPY --from=builder --chown=nestjs:nodejs /usr/src/app/prisma ./prisma

ENV NODE_ENV=production
ENV PORT=3000

USER nestjs

EXPOSE 3000

ENTRYPOINT ["/sbin/tini", "--"]

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]