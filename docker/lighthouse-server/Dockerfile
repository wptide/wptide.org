# Node
FROM node:12-alpine3.12

MAINTAINER XWP <engage@xwp.co>

WORKDIR /app

COPY docker/lighthouse-server/ .
COPY src/ ./src/

RUN apk add --no-cache chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV CHROMIUM_PATH /usr/bin/chromium-browser

RUN npm install

EXPOSE 8080

ENTRYPOINT ["npm", "start"]
