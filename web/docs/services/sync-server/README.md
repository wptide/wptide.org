# Sync Server

The Sync Server is a Node.js app running on an Alpine Linux Docker image that polls the wp.org API's for themes and plugins to process and writes them to appropriate queue.

This sync action is triggered by message submitted every 5 minutes to `MESSAGE_TYPE_SYNC_REQUEST` queue by Google Cloud scheduler job. When running locally, use `npm run start:server:sync` to start this server.

## Commands

| Command | Description |
| :--- | :--- |
| `build.sync` | Build the Sync Server Docker image. |
| `push.sync` | Push the Sync Server Docker image to GCR. |
| `start.sync` | Run the Sync Server Docker container, port 5012. This will also mount `/app/src` as a local volume. |
| `deploy.sync` | Deploy the Sync Server Docker image to Google Cloud. |
| `describe.sync` | Obtain details about Sync Server service from Google Cloud. |
