# Google Cloud

This section will describe how you can build, test, and push the Docker images to GCP for 
use with Cloud Run. As well, we will go over the various deployment commands for setting up 
Firebase Hosting, Cloud Functions, Cloud Run, Cloud Firestore, Cloud Storage, Cloud Pub/Sub 
and Cloud IAM. Basically, this section will get GCP setup for the first time and prepared 
for the CI/CD Pipeline. Keep in mind that you should create two projects, one for staging 
and one for production.

Before running any of the following `make` commands you must first complete all of the
[Installation](../installation) sections up to, and including, the
[API Docs](../installation/#api-docs) section. Once you've completed the installation steps
you can proceed. **It's assumed the environment variables in the `.env` file have already been
set up, excluding the Cloud Run Endpoints which will be added in this section after 
deploying the Cloud Run servers**.

::: tip IMPORTANT

Deploying to your own GCP project has to be done **only once**, after you've set up the
resources for the first time you can use GitHub Actions to deploy to the `main` and
`develop` branches by adding the required environment variables as repository secrets

Before you begin setting up Google Cloud take a moment to get familiar with all the 
available `make` commands. 

Output usage instructions:

    make
:::

## Setup

Setup the Cloud environment:

::: warning IMPORTANT

The following command should only be used once.

    make setup.cloud

This command will update `gcloud`, authenticate you with GCP and Docker, and enable various 
services that Tide requires during deployment.

:::

## Docker Images

The Docker Images need to be built and then pushed to Container Registry for use on Cloud 
Run. You can also run the Docker containers for local development with the `start` commands.

### Build Images

Build the Lighthouse Server Cloud Run image:

    make build.lighthouse

Build the PHPCS Server Cloud Run image:

    make build.phpcs

Build the Sync Server Cloud Run image:

    make build.sync

### Push Images

Push the Lighthouse Server Cloud Run image to Container Registry:

    make push.lighthouse

Push the PHPCS Server Cloud Run image to Container Registry:

    make push.phpcs

Push the Sync Server Cloud Run image to Container Registry:

    make push.sync

### Start Images

Start the Lighthouse Server Cloud Run image locally:
    
    make start.lighthouse

Start the PHPCS Server Cloud Run image locally: 

    make start.phpcs

::: tip IMPORTANT

Start the Sync Server Cloud Run image locally:

    make start.sync

It's rare that you would run the Sync Server locally, though would be required for testing 
when making changes to the functionality. However, keep in mind that headless Chrome cannot 
run multiple instances of Lighthouse at the same time and trying to run a lot of theme 
audits locally will likely result in errors.
:::

## Cloud Storage

Cloud Storage is a service for storing objects, which the Tide API uses to store the various 
report files that get created by the Cloud Run audit servers.

Create the Reports bucket:

::: tip IMPORTANT

The following command should only be used once.

    make setup.bucket

**Note**: Remember to add the name of the newly created Cloud Storage bucket as a repository 
secret for use with GitHub Actions. You can read more below about adding 
[repository secrets](./#repository-secrets). The bucket name will be in the format of 
`<GCP Project ID>-reports`.
:::

### Service Account Keys

Downloads a very permissive `service-account.json` for local development (do not use with 
GitHub Actions):

::: tip IMPORTANT

The following command should only be used once.

    make download.keys
:::

## Firestore

Firestore is a fully managed, scalable, and serverless document database, which is used as 
the data store for the Tide API endpoints.

Create the Firestore database:

::: tip IMPORTANT

The following command should only be used once.

    make setup.firestore
:::

Deploy the Firestore database indexes and rules:

    make deploy.firestore

**At this point you will want to go to the [Firebase Console] and set up your projects 
billing and web hosting, if you haven't already.**

Delete all data from the Firestore database:

::: danger Note

This is a destructive action and cannot be undone!

    make delete.firestore

Could need to be run multiple times if there's too much data, times out, or errors.
:::

## Cloud Run

Cloud Run is a fully managed serverless platform, which is used to deploy highly scalable 
containerized applications. This service is where Tide deploys the various servers used to 
audit every WordPress.org theme & plugin.

::: warning IMPORTANT

**This is an extremely important step before setting up Pub/Sub.** When running one of the 
commands to deploy a service for the first time you will need to get the endpoint URL by 
either taking note of it once the command completes or running the associated 
`make describe.{SERVER}` command. After you have the URL update the `.env` file to ensure 
`GOOGLE_CLOUD_RUN_LIGHTHOUSE`, `GOOGLE_CLOUD_RUN_PHPCS`and `GOOGLE_CLOUD_RUN_SYNC` have all 
been updated with the appropriate values.

Endpoint Format: `https://{SERVER}-{UUID}-uc.a.run.app`
:::

### Lighthouse Server

The Lighthouse Server is used to perform Lighthouse audits and each container can truly only 
have `1` concurrent process running at a time. This is because the headless Chrome instance 
cannot handle multiple requests. Therefore, the `gcloud` command used to deploy the server 
has the [`--concurrency`][concurrency-argument] argument set to `1` and requires 
`GOOGLE_CLOUD_RUN_LIGHTHOUSE_MEMORY` to be set to at least `1024Mi` for the 
[`--memory`][memory-arg] argument.

Deploy the Lighthouse Server to Cloud Run:

    make deploy.lighthouse

Get the Lighthouse Server endpoint on Cloud Run:

    make describe.lighthouse

### PHPCS Server

The PHPCS Server is used to perform PHP Coding Standards audits and while it could 
theoretically handle more than one audit at a time it is safer to have the same
[`--concurrency`][concurrency-argument] argument set to `1` here, as well as, lower the 
required memory in `GOOGLE_CLOUD_RUN_PHPCS_MEMORY` to run the process set to `1024Mi` for 
the [`--memory`][memory-arg] argument.

Deploy the PHPCS Server to Cloud Run:

    make deploy.phpcs

Get the PHPCS Server endpoint on Cloud Run:

    make describe.phpcs

### Sync Server

The Sync Server handles consuming the WordPress.org plugins & themes API to listen for new 
versions being added to the repository. Additionally, it could consume the entire API of 
60k+ projects and all their versions if that was a desired outcome. This server must have 
the [`--concurrency`][concurrency-argument] argument set to `1` and memory in 
`GOOGLE_CLOUD_RUN_SYNC_MEMORY` set to `1024Mi` for the [`--memory`][memory-arg] argument
seems to work well. 

Deploy the Sync Server to Cloud Run:

    make deploy.sync

Get the Sync Server endpoint on Cloud Run:

    make describe.sync

## Cloud Functions

Cloud Functions provides automatically scalable functions as a service (FaaS) to run code 
with zero server management. Both the Tide API and OpenAPI Specification are running on 
this serverless infrastructure. These two functions together provide a publicly available 
self documented API.

### Tide API

Deploy the Tide API to Cloud Functions:

    make deploy.api

### Tide OpenAPI Specification

Deploy the Tide OpenAPI v3 Specification to Cloud Functions:

    make deploy.spec

## Pub/Sub

The Pub/Sub service is messaging and ingestion for streaming analytics and event-driven 
systems, such as Tide. For example, when the Tide API's `audit` endpoint is requested, and 
no report currently exist for the requested version of the theme or plugin, a Pub/Sub message 
is created so that one or more of the various Audit Servers can pick up the job and complete
the task asynchronously.

Deploy IAM, Topics, and Subscriptions to Pub/Sub:

::: tip IMPORTANT

The following command should only be used once.

    make deploy.pubsub
:::

### Scheduler

The Scheduler plays a crucial role in the functioning of the Sync Server within the Tide infrastructure. It is responsible for managing scheduled tasks related to syncing data from the WordPress.org Themes and Plugins APIs. Users may choose to deploy or delete the Scheduler based on their specific needs and operational requirements.

The Sync Server is tasked with consuming data from the WordPress.org plugins and themes API. The Scheduler, as an integral component, orchestrates this data ingestion process. It periodically makes requests to the WordPress.org APIs to determine whether any changes, such as new versions or updates, have occurred since the last scheduled request. When executed, the Scheduler generates messages that are added to a Pub/Sub queue associated with the relevant Report Server. These messages trigger the asynchronous processing of data by the Audit Servers, ensuring the timely update of information related to WordPress themes and plugins.

In summary, the Scheduler is pivotal for keeping the Tide environment synchronized with the dynamic landscape of WordPress.org themes and plugins. Whether deploying it for regular updates or deleting it for more selective syncing, users can tailor the Scheduler's presence to align with their specific requirements and preferences.

Deploy the Scheduler for the Sync Server:

    make deploy.scheduler

Delete the Scheduler:

    make delete.scheduler

## Firebase Hosting

Firebase Hosting is a fully-managed hosting service for static and dynamic content as well 
as microservices such as Tide. The service is backed by SSD storage and a global CDN, and 
is where this VuePress Documentation site is being served from and where traffic to the 
Cloud Functions for the Tide API & its OpenAPI Specification are routed through.

Deploy to Firebase Hosting:

    make deploy.firebase

## CI/CD Pipeline

At this point you should have all GCP services set up and ready to serve traffic. However, 
it's probably a good idea to get the GitHub Actions set up so deployments can be performed 
automatically. When merging into the `develop` branch Actions will deploy to your staging 
GCP project. Merges to `main` will deploy to your production GCP project. For this reason 
you may need to change your `.env` with the staging or production values and go through this 
Google Cloud set up guide a second time, meanwhile setting the relevant repository secrets 
for GitHub Actions after each project is set up.

### Repository secrets

| Environment Variable | Description |
| :--- | :--- |
| `COVERALLS_REPO_TOKEN` | Access token used to send code coverage back to coveralls.io for tracking and visualization. |
| `GOOGLE_CLOUD_PROJECT_NUMBER_PRODUCTION` | Go to the [GCP Console][gcp-console] and select the production project, the **Project number** will be on the welcome screen. |
| `GOOGLE_CLOUD_PROJECT_NUMBER_STAGING` | Go to the [GCP Console][gcp-console] and select the staging project, the **Project number** will be on the welcome screen. |
| `GOOGLE_CLOUD_PROJECT_PRODUCTION` | Go to the [GCP Console][gcp-console] and select the production project, the **Project ID** will be on the welcome screen. |
| `GOOGLE_CLOUD_PROJECT_STAGING` | Go to the [GCP Console][gcp-console] and select the staging project, the **Project ID** will be on the welcome screen. |
| `GOOGLE_CLOUD_RUN_LIGHTHOUSE_MEMORY` | Lighthouse Server value for the [`--memory`][memory-arg] argument. <br />Example: `1024Mi`, `2Gi` |
| `GOOGLE_CLOUD_RUN_PHPCS_MEMORY` | PHPCS Server value for the [`--memory`][memory-arg] argument. <br />Example: `512Mi`, `1024Mi` |
| `GOOGLE_CLOUD_RUN_SYNC_MEMORY` | Sync Server value for the [`--memory`][memory-arg] argument. <br />Example: `512Mi`, `1024Mi` |
| `GOOGLE_CLOUD_SA_PRODUCTION` | GCP IAM JSON Service Account used to authenticate with the production project. |
| `GOOGLE_CLOUD_SA_STAGING` | GCP IAM JSON Service Account used to authenticate with the staging project. |
| `GOOGLE_CLOUD_STORAGE_BUCKET_NAME_PRODUCTION` | Cloud Storage bucket used to store the production audit reports. |
| `GOOGLE_CLOUD_STORAGE_BUCKET_NAME_STAGING` | Cloud Storage bucket used to store the staging audit reports. |

### Service Accounts

GitHub Actions requires a service account to authenticate with the Google Cloud SDK, Google 
Cloud Registry, and Firebase.

#### 1. Create a service account that the action will use to deploy

1. Visit the [GCP Service Accounts page][sa-account] and make sure the correct project is 
  selected in the top blue bar
2. Click the "+ CREATE SERVICE ACCOUNT" button
3. Give the service account a name, id, description. We recommend something like 
  `github-actions-<repository-name>`
4. At the "Grant this service account access to project" step, choose the following 
  [roles][roles] that the service account will need to deploy on your behalf:
   - **Firebase Authentication Admin** (Required to add preview URLs to Auth authorized domains)
     - `roles/firebaseauth.admin`
   - **Firebase Hosting Admin** (Required to deploy preview channels)
     - `roles/firebasehosting.admin`
   - **Cloud Run Viewer** (Required for projects that 
    [use Hosting rewrites to Cloud Run or Cloud Functions][serverless-overview])
     - `roles/run.viewer`
   - **API Keys Viewer** (Required for CLI deploys)
     - `roles/serviceusage.apiKeysViewer`
   - **@todo add final required permissions**
5. Finish the service account creation flow

#### 2. Get that service account's key and add it to your repository as a secret

1. [Create and download][new-sa] the new service account's JSON key
1. Add that JSON key [as an encrypted secret in your GitHub repository][secrets]

[Firebase Console]: https://console.firebase.google.com/
[concurrency-argument]: https://cloud.google.com/sdk/gcloud/reference/run/deploy#--concurrency
[memory-arg]: https://cloud.google.com/sdk/gcloud/reference/run/deploy#--memory
[gcp-console]: https://console.cloud.google.com/welcome
[sa-account]: https://console.cloud.google.com/iam-admin/serviceaccounts
[roles]: https://firebase.google.com/docs/projects/iam/roles-predefined-product
[serverless-overview]: https://firebase.google.com/docs/hosting/serverless-overview
[new-sa]: https://cloud.google.com/iam/docs/creating-managing-service-account-keys#creating_service_account_keys
[secrets]: https://docs.github.com/en/free-pro-team@latest/actions/reference/encrypted-secrets#creating-encrypted-secrets-for-a-repository
