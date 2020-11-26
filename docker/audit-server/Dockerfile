# Node
FROM node:12-alpine3.12

MAINTAINER XWP <engage@xwp.co>

WORKDIR /app

COPY docker/audit-server/ .
COPY src/ ./src/

RUN npm install

EXPOSE 8080

ENTRYPOINT ["npm", "start"]
