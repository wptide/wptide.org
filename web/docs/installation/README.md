# Installation

Unless your host machine is missing most of the [prerequisite](#prerequisites) setting up Tide locally should take around 5-10 minutes and consists of the following steps:

1. Install all the required [prerequisite](#prerequisites) software.
1. Create a new [Firebase Project](#firebase-project).
1. [Clone](#clone-tide) the Tide repository.
1. Install the [Firebase CLI](#firebase-cli).
1. Execute the initial [setup](#setup) commands.
1. Generate the [API Docs](#api-docs).
1. Run the [Firebase Emulator Suite](#firebase-emulator-suite).
1. Start the [Proxy Server](#proxy-server).
1. Finally, start the [Cloud Run Servers](#cloud-run-servers).

If you run into any issues while getting Tide installed please [contact us](../README.md#contact-us), so we can address it and update the documentation for others. If you only want to contribute to the documentation read about the `npm run docs:serve` command in the [API Docs](#api-docs) section first.

## Prerequisites

There are several CLI tools that need to be installed on your system before you can meaningfully contribute to the Tide Component. Docker is optional, but required if you plan to build the images and test them locally, and `make` and the Google Cloud SDK are needed if you are building images and/or deploying to GCP.

* Install [Composer](https://getcomposer.org/)
* Install [Node](https://nodejs.org/en/download/)
* Install [Firebase CLI](https://firebase.google.com/docs/cli)
* Install [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) (optional)
* Install [Docker](https://docs.docker.com/get-docker/) (optional)
* Install [Make for Windows](http://gnuwin32.sourceforge.net/packages/make.htm) (optional) (Windows only)

## Firebase Project

If you don't have a Firebase project, then start by creating a new project from the [Firebase Console](https://console.firebase.google.com/). Later we'll connect your cloned version of Tide to your Firebase project—we don't need to actually use the project, just authenticate with it. Setting up a Firebase project will not cost you anything, it just needs to exist for authentication purposes. Make a note of the Project ID you choose, you will need it later.

## Clone Tide

Tide can be cloned anywhere on your computer, but avoid putting it in a directory path with spaces as that can break `npm` compilers.

Clone the repository:

    git clone git@github.com:wptide/wptide.org.git

Change directories:

    cd wptide.org

## Firebase CLI

The Firebase Emulator Suite is part of the Firebase CLI (command-line interface) which can be installed on your machine with the following command:

    npm install -g firebase-tools

Log in to the Firebase CLI:

    firebase login

Optionally you can run the following command to create a project alias. First, select your project from the list. When asked what alias you want to use, choose **default**.

    firebase use --add

The output should look like the following example. Remember to choose your actual Firebase project from the list:

    ? Which project do you want to add? YOUR_PROJECT_ID
    ? What alias do you want to use for this project? (e.g. staging) default
    
    Created alias default for YOUR_PROJECT_ID.
    Now using alias default (YOUR_PROJECT_ID)

## Setup

After running the following commands you should be able to generate the docs, run the emulators, and setup all the various services that make up the Tide Component.

::: warning

If any of the `localhost` ports for the Tide services below are in use on your host machine there will be a port collision, and you will need to stop the running services on the required ports for Tide to function correctly.

:::

Copy the hidden files:

::: tip IMPORTANT

The following command should only be used once.

    npm run copy

The new `.env` is for the Firebase Functions API and the `.env.server` is for the Docker based Cloud Run Servers. Both files are for local development only and likely do not require any changes, except for the project ID that you previously created should now be used as the value for the `GOOGLE_CLOUD_PROJECT` environment variable.

Also, make sure to update `.firebaserc` with the project ID after this command is executed. The project ID will be the value associated to the `default` key in `.firebaserc`.

:::

Install the `npm` and `composer` dependencies:

    npm run setup

## API Docs

The API Docs are generated with [VuePress](https://vuepress.vuejs.org/), which is a Vue-powered Static Site Generator that converts the Markdown files into a searchable static site. There is also a Firebase Function that converts the OpenAPI Specification into an interactive visualization of the API’s resources using Swagger UI. However, the API Specification is run with the Firebase Emulator Suite and doesn't require any additional setup.

::: tip IMPORTANT

When contributing to the documentation **only**, you can run the `serve` command and ignore the rest of the commands on this page except in the [Clone Tide](#clone-tide), and [Setup](#setup) sections.

:::

If you are doing development on Tide, not just the documentation, you will need to run the `build` command each time you make changes in the `web` directory, and the first time you start Tide. The `serve` command will not refresh the emulator because it hosts the statically generated files i.e. the output of the `build` command.

Build the front-end:

    npm run docs:build

Serve the front-end:

::: tip IMPORTANT

The front-end dev server runs on `localhost` port `8000`.

    npm run docs:serve

:::

## Firebase Emulator Suite

The Firebase Emulator Suite is required to emulate Firebase Hosting, Cloud Functions, Cloud Firestore, and Cloud Pub/Sub. These emulators must be running in order for Tide to process WordPress.org themes and plugins.

Start Emulator:

::: tip IMPORTANT
Firebase Hosting runs on `localhost` port `5000`, Firestore `5001`, Functions `5002`, and Pub/Sub `5003`

    npm run start:emulator

:::

## Proxy Server

The Proxy Server proxies emulated Pub/Sub messages to their respective HTTP endpoints and must be executed anytime you start the Firebase Emulator Suite, ideally before starting the Cloud Run Severs, so you don't accidentally forget to add the local proxy and wonder why audits are not running.

Start the local Pub/Sub Proxy:

    npm run start:server:proxy

## Cloud Run Servers

When doing local development each server is running within an instance of the [Functions Framework for Node.js](https://github.com/GoogleCloudPlatform/functions-framework-nodejs) inside a continuously running shell. This way we can remove the need to build Docker images.

Start the Lighthouse server:

::: tip IMPORTANT
The Lighthouse server runs on `localhost` port `5010`.

    npm run start:server:lighthouse

:::

Start the PHPCS server:

::: tip IMPORTANT
The PHPCS server runs on `localhost` port `5011`.

    npm run start:server:phpcs

:::
