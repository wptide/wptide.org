# tide-faas
OpenAPI Tide Implementation

## Prerequisites
* Install gcloud https://cloud.google.com/sdk/docs/install
* Install gcloud emulator for pubsub https://cloud.google.com/pubsub/docs/emulator
* Install gcloud emulator for datastore https://cloud.google.com/datastore/docs/tools/datastore-emulator
* Install docker https://docs.docker.com/get-docker/

### Firebase Hosting
To test and deploy the Firebase hosting environment you will also need to install the [Firestore CLI](https://firebase.google.com/docs/cli).

## Local Setup

To get the API setup we need to install the NPM packages and create the `.env` and `.env.server` files used in local development **only**. The `.env` is for the Cloud Functions API and `.env.server` for the Cloud Run Servers.

```
make setup.api
```

Alternatively, you can run the following commands separately to create those files and install NPM:

```
cp .env.dist .env
```

```
cp .env.server.dist .env.server
```

```
cd app && npm install
```

### Build Images
* Build Lighthouse Cloud Run image: `make build.lighthouse-server`
* Build PHPCS Cloud Run image: `make build.phpcs-server`

### Start Emulators
* Start datastore: `make start.emulator.datastore`
* Start pubsub: `make start.emulator.pubsub`

### Start Servers
* Start Cloud Functions API: `make start.api`
* Start Lighthouse Cloud Run container: `make start.lighthouse-server`
* Start PHPCS Cloud Run container: `make start.phpcs-server`
* Start local Pub/Sub Proxy: `make start.proxy-server`

### Example API Requests
* Browse to this URL: http://localhost:8080/api/v1/audit/wordpress/theme/twentytwenty/1.5
* Browse to this URL: http://localhost:8080/api/v1/audit/wordpress/plugin/pwa/0.5.0
