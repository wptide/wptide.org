# wptide.org
Firebase hosted VuePress documentation site for [wptide.org](https://wptide.org). Along with an implementation of Tide using the OpenAPI Specification v3 deployed to Cloud Functions and Cloud Run.

## Prerequisites
* Install [Node](https://nodejs.org/en/download/)
* Install [Docker](https://docs.docker.com/get-docker/)
* Install [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
* Install [Pub/Sub emulator](https://cloud.google.com/pubsub/docs/emulator)
* Install [Datastore emulator](https://cloud.google.com/datastore/docs/tools/datastore-emulator)
* Install [Firebase CLI](https://firebase.google.com/docs/cli)
* Install [Make for Windows](http://gnuwin32.sourceforge.net/packages/make.htm) (Windows only)

## Local Setup

Clone the repository:

```
git clone git@github.com:wptide/wptide.org.git
```

Install dependencies:

```
npm install
```

Setup the API by installing the dependencies and creating the `.env` and `.env.server` files.

```
make setup.api
```

_The `.env` is for the Cloud Functions API and `.env.server` for the Cloud Run Servers. Both are only used locally._

Setup the `.firebaserc` file (optional):

```
make setup.firebase
```
	
### Docs Generator
* Build front-end: `npm run build`
* Serve front-end: `npm run dev`

_**Note**: The front-end dev server runs on port `8000`_

### Build Images
* Build Lighthouse Cloud Run image: `make build.lighthouse-server`
* Build PHPCS Cloud Run image: `make build.phpcs-server`

### Start Emulators
* Start Datastore: `make start.emulator.datastore`
* Start Firebase (optional): `make start.emulator.firebase`
* Start Pub/Sub: `make start.emulator.pubsub`

_**Note**: Datastore runs on port `8081`, Firestore run on port `5000`, and Pub/Sub runs on port `8085`_

### Start Servers
* Start Cloud Functions API: `make start.api`
* Start Lighthouse Cloud Run container: `make start.lighthouse-server`
* Start PHPCS Cloud Run container: `make start.phpcs-server`
* Start local Pub/Sub Proxy: `make start.proxy-server`

_**Note**: The Cloud Functions API runs on port `8080`, the Lighthouse Server runs on port `8090`, and the PHPCS Server runs on port `8110`. If any of these ports are in use on your host machine there will be a port collision._

### Example API Requests
* Browse to this URL: http://localhost:8080/api/v1/audit/wordpress/theme/twentytwenty/1.5
* Browse to this URL: http://localhost:8080/api/v1/audit/wordpress/plugin/pwa/0.5.0
