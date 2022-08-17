# Sync Server

The Sync Server is a Node.js app running on an Alpine Linux Docker image that polls the wp.org API's for themes and plugins to process and writes them to appropriate queue.

The sync process is triggered by message submitted every 5 minutes to `MESSAGE_TYPE_SYNC_REQUEST` queue by Google Cloud scheduler job.

When running locally, use `npm run start:server:sync` to start this server. Then, open the `http://localhost:5012/` url to start the sync process.

::: tip IMPORTANT

Turning on the Sync Server on will put around 50k audits in the queue which will take days to process locally and potentially lock up all your computers resources, so you probably want to stop its execution after fetching a couple of messages, which you can do with `Ctrl+C` in your keyboard.

:::

## Commands

| Command | Description |
| :--- | :--- |
| `build.sync` | Build the Sync Server Docker image. |
| `push.sync` | Push the Sync Server Docker image to GCR. |
| `start.sync` | Run the Sync Server Docker container, port 5012. This will also mount `/app/src` as a local volume. |
| `deploy.sync` | Deploy the Sync Server Docker image to Google Cloud. |
| `describe.sync` | Obtain details about Sync Server service from Google Cloud. |
