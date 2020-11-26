# tide-faas
OpenAPI Tide Implementation

# Prerequisites
* Install gcloud https://cloud.google.com/sdk/docs/install
* Install gcloud emulator for pubsub https://cloud.google.com/pubsub/docs/emulator
* Install gcloud emulator for datastore https://cloud.google.com/datastore/docs/tools/datastore-emulator
* Install docker https://docs.docker.com/get-docker/

# Local Testing Setup

## Build Images
* Build PHPCS Cloud Run image from src directory: `docker build --no-cache -t tidephpcs:latest -f docker/phpcs/Dockerfile .`

## Start Emulators
* Start datastore: `npm run start:emulator:datastore`
* Start pubsub: `npm run start:emulator:pubsub`

## Start Services
* Start Cloud Functions API: `npm start`
* Start PHPCS Cloud Run container: `docker run -p 8110:8110 --env-file .env --env ENDPOINT_PUBSUB=host.docker.internal:8085 tidephpcs:latest`
* Start lighthouse: `npm run start:lighthouse`
* Start audit response handler: `npm run start:audit-response`

# Testing the API

* Browse to this URL: http://localhost:8080/api/v1/audit/wporg/theme/twentynineteen/1.7
* Browse to this URL: http://localhost:8080/api/v1/audit/wporg/plugin/stream/3.6.0
