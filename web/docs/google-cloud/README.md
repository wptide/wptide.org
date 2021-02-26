# Google Cloud

This section will describe how you can build, test, and push the Docker images to GCP for use with Cloud Run. As well, we will go over the various deployment commands for setting up Firebase Hosting, Firebase Functions, Cloud Run, Cloud Firestore, Cloud Pub/Sub and Cloud IAM.

## Build Images

* Build Lighthouse Cloud Run image: `make build.lighthouse`
* Build PHPCS Cloud Run image: `make build.phpcs`

## Push Images

* Push Lighthouse Cloud Run image: `make push.lighthouse`
* Push PHPCS Cloud Run image: `make push.phpcs`

## Start Images

* Start Lighthouse Cloud Run image: `make start.lighthouse`
* Start PHPCS Cloud Run image: `make start.phpcs`
