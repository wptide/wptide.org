# tide-faas
OpenAPI Tide Implementation

# Prerequisites
* Install gcloud https://cloud.google.com/sdk/docs/install
* Install gcloud emulator for pubsub https://cloud.google.com/pubsub/docs/emulator
* Install gcloud emulator for datastore https://cloud.google.com/datastore/docs/tools/datastore-emulator
* Install docker https://docs.docker.com/get-docker/

# Local Testing Setup

* Build phpcs docker container from src directory: `docker build --tag tidephpcs:0.36 -f phpcs/Dockerfile .`
* Start datastore: `npm run start:emulator:datastore`
* Start pubsub: `npm run start:emulator:pubsub`
* Start local event proxy: `npm run start:local-proxy`
* Start API handler: `npm start`
* Start lighthouse: `npm run start:lighthouse`
* Start audit response handler: `npm run start:audit-response`
* Start phpcs docker container: `docker run -p 8110:8080 tidephpcs:0.36`

# Testing the API

* Browse to this URL: http://localhost:8080/api/v1/audit/wporg/theme/twentynineteen/1.7
* Browse to this URL: http://localhost:8080/api/v1/audit/wporg/plugin/stream/3.6.0
