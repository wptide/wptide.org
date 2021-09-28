# Google Cloud

This section will describe how you can build, test, and push the Docker images 
to GCP for use with Cloud Run. As well, we will go over the various deployment 
commands for setting up Firebase Hosting, Cloud Functions, Cloud Run, Cloud 
Firestore, Cloud Pub/Sub and Cloud IAM. Basically, this section will get GCP
setup for the first time and prepared for the CI/CD Pipeline.

## Setup

Before running the following commands complete all the [Installation](../installation) 
sections up to, and including, the [API Docs](../installation/#api-docs) section. 
Once you've completed the installation steps you can proceed. 

Setup the Cloud environment:

::: tip IMPORTANT

The following command should only be used once.

    make setup.cloud
:::

## Docker Images

The Docker Images need to be built and then pushed to Container Registry for use 
on Cloud Run. You can also run the Docker containers for local development with 
the `start` commands.

### Build Images

Build the Lighthouse Cloud Run image:

    make build.lighthouse

Build the PHPCS Cloud Run image:

    make build.phpcs

Build the Sync Cloud Run image:

    make build.sync

### Push Images

Push the Lighthouse Cloud Run image to Container Registry:

    make push.lighthouse

Push the PHPCS Cloud Run image to Container Registry:

    make push.phpcs

Push the Sync Cloud Run image to Container Registry:

    make push.sync

### Start Images

Start the Lighthouse Cloud Run image locally:
    
    make start.lighthouse

Start the PHPCS Cloud Run image locally: 

    make start.phpcs

::: tip IMPORTANT

Start the Sync Cloud Run image locally:

    make start.sync

It's rare that you would run the sync server locally, though would be required for 
testing when making changes to the functionality. However, keep in mind that headless 
Chrome cannot run multiple instances of Lighthouse at the same time and trying to
run a lot of audits locally will likely result in errors.
:::

## Cloud Storage

Cloud Storage is a service for storing objects, which the Tide API uses to store 
the various report files that get created by the Cloud Run audit servers.

Create the Reports bucket:

::: tip IMPORTANT

The following command should only be used once.

    make setup.bucket
:::

### Service Account Keys

Download `service-account.json` for local development:

::: tip IMPORTANT

The following command should only be used once.

    make download.keys
:::

## Firestore

Firestore is a fully managed, scalable, and serverless document database, which is used
as the data store for the Tide API endpoints.

Create the Firestore database:

::: tip IMPORTANT

The following command should only be used once.

    make setup.firestore
:::

Deploy the Firestore database indexes and rules:

    make deploy.firestore

**At this point you will want to go to the [Firebase Console] and set up your project, 
if you haven't already.**

Delete all data from the Firestore database:

::: danger Note

This is a destructive action and cannot be undone!

    make delete.firestore
:::

## Cloud Run

Cloud Run is a fully managed serverless platform, which is used to deploy highly 
scalable containerized applications. This service is where Tide deploys the various
servers used to audit every WordPress.org theme & plugin.

::: warning IMPORTANT

**This is an extremely important step before setting up Pub/Sub.** When running one 
of the commands to deploy a service for the first time you will need to get the 
endpoint URL by either taking note of it once the command completes or running the 
associated `make describe.{SERVER}` command. After you have the URL update the 
`.env` file to ensure `GOOGLE_CLOUD_RUN_LIGHTHOUSE`, `GOOGLE_CLOUD_RUN_PHPCS`and 
`GOOGLE_CLOUD_RUN_SYNC` have all been updated with the appropriate values.
:::

### Lighthouse Server

The Lighthouse Server is used to perform Lighthouse audits and each container can truly 
only have `1` concurrent process running at a time. This is because the headless Chrome 
instance cannot handle multiple requests. Therefore, the `gcloud` command used to deploy
the server has the `--concurrency` flag set to `1` and requires the memory to be set to
at least `1024`.

Deploy the Lighthouse Server to Cloud Run:

    make deploy.lighthouse

Get the Lighthouse Server endpoint on Cloud Run:

    make describe.lighthouse

### PHPCS Server

The PHPCS Server is used to perform PHP Coding Standards audits and while it could 
theoretically handle more than one audit at a time it is safer to have the same 
`--concurrency` flag set to `1` here, as well as, lower the required memory to run
the process to `512`.

Deploy the PHPCS Server to Cloud Run:

    make deploy.phpcs

Get the PHPCS Server endpoint on Cloud Run:

    make describe.phpcs

### Sync Server

The Sync Server handles consuming the WordPress.org plugins & themes API to listen for 
new versions being added to the repository. Additionally, it could consume the entire 
API of 60k+ projects and all their versions if that was a desired outcome. This server
must have the `--concurrency` flag set to `1` and memory set to `512` seems to work well. 

Deploy the Sync Server to Cloud Run:

    make deploy.sync

Get the Sync Server endpoint on Cloud Run:

    make describe.sync

## Cloud Functions

Cloud Functions provides automatically scalable functions as a service (FaaS) to run 
code with zero server management. Both the Tide API and OpenAPI Specification are 
running on this serverless infrastructure. These two functions together provide a 
publicly available self documented API.

### Tide API

Deploy the Tide API to Cloud Functions:

    make deploy.api

### Tide OpenAPI Specification

Deploy the Tide OpenAPI Specification to Cloud Functions:

    make deploy.spec

## Pub/Sub

Pub/Sub is messaging and ingestion for streaming analytics and event-driven systems such 
as Tide. For example, when the Tide API's `audit` endpoint is requested, and no report 
currently exist, a Pub/Sub message is created so that one or more of the various Audit 
Servers can pick up the job and complete the task.

Deploy IAM, Topics, and Subscriptions to Pub/Sub:

::: tip IMPORTANT

The following command should only be used once.

    make deploy.pubsub
:::

### Scheduler

Deploy the Scheduler for the Sync Server:

    make deploy.scheduler

Delete the Scheduler:

    make delete.scheduler

## Firebase Hosting

Firebase Hosting is a fully-managed hosting service for static and dynamic content as 
well as microservices such as Tide. The service is backed by SSD storage and a global 
CDN, and is where this VuePress Documentation site is being served from and where 
traffic to the Cloud Functions for the Tide API & its OpenAPI Specification are 
routed through.

Deploy to Firebase Hosting:

    make deploy.firebase


[Firebase Console]: https://console.firebase.google.com/
