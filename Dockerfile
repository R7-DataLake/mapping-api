FROM node:18-alpine AS builder

LABEL maintainer="Satit Rianpit <rianpit@gmail.com>"

WORKDIR /app

RUN apk add --no-cache python3 g++

COPY . .

RUN npm i && npm run build

RUN rm -f Dockerfile nodemon.json pnpm-lock.yaml run.sh tsconfig.json gulpfile.js

RUN rm -rf src @types demo scripts node_modules && \
  npm i --omit=dev && \
  npm rebuild bcrypt

FROM node:18-alpine

COPY --from=builder /app /app

WORKDIR /app

RUN apk add --no-cache g++

RUN npm i -g pm2

EXPOSE 3000

CMD ["pm2-runtime", "--json", "/app/process.json"]