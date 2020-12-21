# Installation

Setting up Tide locally is fairly straight forward and consists of the following steps:

1. Installing all the [prerequisite](#prerequisites) software.
1. [Cloning](#cloning) the Tide repository.
1. Finally, completing a handful of [setup](#setup) steps in the form of `npm` commands.

::: tip
If you run into issues while getting Tide installed please contact us, so we can address it and update the documentation for others.
:::

## Prerequisites

There are several CLI tools that need to be installed on your system before you can meaningfully contribute to the Tide Component. The Firebase CLI is optional, but required if you need to emulate Firebase hosting locally. Docker is optional, but required in you plan to build the images and test them locally, and `make` is needed if you are building images and/or deploying to GCP.

* Install [Composer](https://getcomposer.org/)
* Install [Node](https://nodejs.org/en/download/)
* Install [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
* Install [Pub/Sub emulator](https://cloud.google.com/pubsub/docs/emulator)
* Install [Datastore emulator](https://cloud.google.com/datastore/docs/tools/datastore-emulator)
* Install [Firebase CLI](https://firebase.google.com/docs/cli) (optional)
* Install [Docker](https://docs.docker.com/get-docker/) (optional)
* Install [Make for Windows](http://gnuwin32.sourceforge.net/packages/make.htm) (optional) (Windows only)

::: danger
If any of the `localhost` ports for the Tide services below are in use on your host machine there will be a port collision, and you will need to stop the running services on the required ports for everything to function correctly.
:::

## Cloning

Tide can be cloned anywhere on your computer, but avoid putting it in a directory path with spaces as that can break `npm` compilers.

Clone the repository:

    git clone git@github.com:wptide/wptide.org.git

Change directories:

    cd wptide.org

## Setup

After running these commands you should be able to build the documentation and setup all the various services that make up the Tide Component.

Copy the hidden files:

::: tip Important
This command should only be used once. The new `.env` is for the Cloud Functions API and the `.env.server` is for the Docker Cloud Run Servers. Both files are for local development only and likely do not require any changes.

    npm run copy
:::

Install `npm` and `composer` dependencies:

    npm run setup

## Emulators

The local Datastore and Pub/Sub emulators must be running in order for Tide to process WordPress.org themes and plugins. The Firebase emulator is optional and only needs to be running if you plan to test Firebase hosting locally.

Start Datastore:

::: tip Important
Datastore runs on `localhost` port `8081`.

    npm run start:emulator:datastore
:::

Start Firebase (optional):

::: tip Important
Firestore run on `localhost` port `5000`.

    npm run start:emulator:firebase
:::

Start Pub/Sub:

::: tip Important
Pub/Sub runs on `localhost` port `8085`.

    npm run start:emulator:pubsub
:::

## Servers

When doing local development each server is running within an instance of the [Functions Framework for Node.js](https://github.com/GoogleCloudPlatform/functions-framework-nodejs) inside a continuously running shell. This way we can remove the need to build Docker images locally.

Start the API server:

::: tip Important
The API server runs on `localhost` port `8080`.

    npm run start
:::

Start the Lighthouse server:

::: tip Important
The Lighthouse server runs on `localhost` port `8090`.

    npm run start.server.lighthouse
:::

Start the PHPCS server:

::: tip Important
The PHPCS server runs on `localhost` port `8110`.

    npm run start.server.phpcs
:::

## Proxy

Start the local Pub/Sub Proxy: 

    npm run start.server.proxy

## Docs

These docs are generated with [VuePress](https://vuepress.vuejs.org/), which is a Vue-powered Static Site Generator that converts several Markdown files into a searchable static site.

Build the front-end:

    npm run docs:build

Serve the front-end:

::: tip Important
The front-end dev server runs on `localhost` port `8000`.

    npm run docs:serve
:::
