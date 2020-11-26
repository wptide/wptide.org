# tide-faas
OpenAPI Tide Implementation

## Prerequisites
* Install gcloud https://cloud.google.com/sdk/docs/install
* Install gcloud emulator for pubsub https://cloud.google.com/pubsub/docs/emulator
* Install gcloud emulator for datastore https://cloud.google.com/datastore/docs/tools/datastore-emulator
* Install docker https://docs.docker.com/get-docker/

## Local Setup

### Build Images
* Build Audit Cloud Run image: `npm run build:audit-server`
* Build Lighthouse Cloud Run image: `npm run build:lighthouse-server`
* Build PHPCS Cloud Run image: `npm run build:phpcs-server`

### Start Emulators
* Start datastore: `npm run start:emulator:datastore`
* Start pubsub: `npm run start:emulator:pubsub`

### Start Servers
* Start Cloud Functions API: `npm start`
* Start Audit Cloud Run container: `npm run start:audit-server`
* Start Lighthouse Cloud Run container: `npm run start:lighthouse-server`
* Start PHPCS Cloud Run container: `npm run start:phpcs-server`
* Start local Pub/Sub Proxy: `npm run start:proxy-server`

### Example API Requests
* Browse to this URL: http://localhost:8080/api/v1/audit/wporg/theme/twentynineteen/1.7
* Browse to this URL: http://localhost:8080/api/v1/audit/wporg/plugin/stream/3.6.0
