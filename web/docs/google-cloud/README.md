# Google Cloud

This section will describe how you can build, test, and push the Docker images to GCP for use with Cloud Run. As well, we will go over the various deploy commands for setting up Firebase, Cloud Functions, Cloud Run, Datastore, Pub/Sub and IAM.

## Build Images
* Build Lighthouse Cloud Run image: `make build.lighthouse`
* Build PHPCS Cloud Run image: `make build.phpcs`

## Push Images
* Push Lighthouse Cloud Run image: `make push.lighthouse`
* Push PHPCS Cloud Run image: `make push.phpcs`

## Start Images
* Start Lighthouse Cloud Run image: `make start.lighthouse`
* Start PHPCS Cloud Run image: `make start.phpcs`
