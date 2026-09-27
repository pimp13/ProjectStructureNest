FROM node:24-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

RUN npm prune --production


FROM node:24-alpine AS production

WORKDIR /usr/src/app

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001


COPY --from=builder --chown=nestjs:nodejs /usr/src/app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /usr/src/app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /usr/src/app/package*.json ./

ENV NODE_ENV=production
ENV PORT=3000

USER nestjs

EXPOSE 3000

CMD ["npm", "run", "start:prod"]