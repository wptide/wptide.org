# PHP
FROM php:7.4-cli-alpine3.12 as backend

MAINTAINER XWP <engage@xwp.co>

WORKDIR /app

COPY app/docker/phpcs-server/ .

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/bin --filename=composer
RUN echo 'memory_limit = -1' >> /usr/local/etc/php/conf.d/memory-limit.ini
RUN composer install

# Node
FROM node:12-alpine3.12

WORKDIR /app

COPY app/docker/phpcs-server/ .
COPY app/src/ ./src/
COPY --from=backend /usr/ /usr/
COPY --from=backend /app/vendor/ ./vendor/

RUN npm install

EXPOSE 8080

ENTRYPOINT ["npm", "start"]
