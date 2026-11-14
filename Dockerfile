# ---------- Stage 1: cài đủ dependencies + build Tailwind CSS ----------
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build:css

# ---------- Stage 2: image chạy ứng dụng (chỉ dependencies production) ----------
FROM node:24-alpine
ENV NODE_ENV=production \
    TZ=Asia/Ho_Chi_Minh
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --chown=node:node . .
COPY --from=build --chown=node:node /app/public/css/tailwind.css ./public/css/tailwind.css
RUN mkdir -p public/uploads && chown -R node:node public/uploads
USER node
EXPOSE 3000
# Chạy migrate -> seed (nếu SEED_ON_START=true) -> start server
CMD ["npm", "run", "start:docker"]
