# Composer
FROM composer:2.0 as vendor

MAINTAINER XWP <engage@xwp.co>

WORKDIR /app

COPY app/docker/phpcs-server/ .

RUN composer install

# PHP
FROM php:7.4-cli-alpine3.12 as backend

RUN echo 'memory_limit = -1' >> /usr/local/etc/php/conf.d/memory-limit.ini

# Node
FROM node:12-alpine3.12

WORKDIR /app

COPY app/docker/phpcs-server/ .
COPY app/src/ ./src/
COPY --from=backend /usr/ /usr/
COPY --from=vendor /app/vendor/ ./vendor/

RUN npm install

EXPOSE 8080

ENTRYPOINT ["npm", "start"]
