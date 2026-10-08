FROM node:26-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:26-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=4310 DATABASE_PATH=/data/orders.sqlite
COPY package*.json ./
RUN npm ci --omit=dev && mkdir /data && chown node:node /data
COPY --from=build /app/build ./build
COPY --from=build /app/dist ./dist
USER node
EXPOSE 4310
CMD ["node", "build/server/index.js"]
