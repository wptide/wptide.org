# [wptide.org](https://wptide.org)
Firebase hosted static documentation website built with VuePress, along with an implementation of Tide using the OpenAPI v3 Specification deployed to Cloud Functions with a Lighthouse and PHPCS Cloud Run server auditing wp.org themes & plugins, backed by Datastore with Pub/Sub events.

## Requirements
* Install [Node](https://nodejs.org/en/download/)
* Install [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
* Install [Pub/Sub emulator](https://cloud.google.com/pubsub/docs/emulator)
* Install [Datastore emulator](https://cloud.google.com/datastore/docs/tools/datastore-emulator)
* Install [Firebase CLI](https://firebase.google.com/docs/cli) (optional)

## Local Setup

Clone the repository:

```
git clone git@github.com:wptide/wptide.org.git
```

Copy the hidden files and install `npm` dependencies:

```
npm run setup && npm i && cd app && npm i && cd -
```

_The `.env` is for the Cloud Functions API and the `.env.server` is for the Docker Cloud Run Servers. Both files are for local use only._

Setup Composer dependencies:

```
cd app && composer install && cd -
```

### Docs Generator
* Build front-end: `npm run docs:build`
* Serve front-end: `npm run docs:serve`

_**Note**: The front-end dev server runs on port `8000`_

### Start Emulators
* Start Datastore: `npm run start:emulator:datastore`
* Start Firebase (optional): `npm run start:emulator:firebase`
* Start Pub/Sub: `npm run start:emulator:pubsub`

_**Note**: Datastore runs on port `8081`, Firestore run on port `5000`, and Pub/Sub runs on port `8085`_

### Start Servers
* Start Cloud Functions API: `npm run start`
* Start Lighthouse Cloud Run container: `npm run start.server.lighthouse`
* Start PHPCS Cloud Run container: `npm run start.server.phpcs`
* Start local Pub/Sub Proxy: `npm run start.server.proxy`

_**Note**: The Cloud Functions API runs on port `8080`, the Lighthouse Server runs on port `8090`, and the PHPCS Server runs on port `8110`. If any of these ports are in use on your host machine there will be a port collision._

### Example API Requests
* Browse to this URL: http://localhost:8080/api/v1/audit/wordpress/theme/twentytwenty/1.6
* Browse to this URL: http://localhost:8080/api/v1/audit/wordpress/plugin/pwa/0.5.0

## Google Cloud Setup

__Optional, most contributors can ignore below__.

This section will describe how you can build, test, and push the Docker images to GCP for use with Cloud Run. As well, we will go over the various deploy commands for setting up Firebase, Cloud Functions, Cloud Run, Datastore, Pub/Sub and IAM.

### Requirements
* Install [Docker](https://docs.docker.com/get-docker/)
* Install [Make for Windows](http://gnuwin32.sourceforge.net/packages/make.htm) (Windows only)

### Build Images
* Build Lighthouse Cloud Run image: `make build.lighthouse`
* Build PHPCS Cloud Run image: `make build.phpcs`

### Push Images
* Push Lighthouse Cloud Run image: `make push.lighthouse`
* Push PHPCS Cloud Run image: `make push.phpcs`

### Start Images
* Start Lighthouse Cloud Run image: `make start.lighthouse`
* Start PHPCS Cloud Run image: `make start.phpcs`
