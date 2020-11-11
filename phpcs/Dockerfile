FROM php:7.4-cli-alpine
MAINTAINER XWP <engage@xwp.co>
ENV VENDOR /app/vendor
RUN apk add --no-cache composer jq
COPY . /app
WORKDIR /app
RUN composer install \
    && echo 'memory_limit = -1' >> /etc/php7/conf.d/memory-limit.ini \
    && $VENDOR/bin/phpcs --config-set show_progress 1 \
    && $VENDOR/bin/phpcs --config-set colors 1 \
    && $VENDOR/bin/phpcs --config-set installed_paths $VENDOR/wp-coding-standards/wpcs,$VENDOR/phpcompatibility/php-compatibility,$VENDOR/phpcompatibility/phpcompatibility-wp,$VENDOR/phpcompatibility/phpcompatibility-passwordcompat,$VENDOR/phpcompatibility/phpcompatibility-paragonie,$VENDOR/phpcompatibility/phpcompatibility-symfony

ENTRYPOINT ["/bin/sh", "/app/docker-entrypoint.sh"]
