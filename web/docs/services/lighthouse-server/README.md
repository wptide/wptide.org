# Lighthouse Server

The Lighthouse Server is a Node.js app running on an Alpine Linux Docker image that reads messages from a queue and runs Google Lighthouse reports against themes.

Once completed, the Node.js app creates two new files in Firestore: one for Audit and one for Report. It also updates the Status file, modifying status (which now can be either "completed" or "failed") and relevant datetime fields.

It is important to note that the server only works for wp.org themes and the most recent version of it. This means that in a headless instance of Chromium the Lighthouse CLI audits each theme by loading the demo version found on [wp.org themes](https://wordpress.org/themes), which is always the latest version so if you request a theme audit for a previous version the results will be for the latest one.

This audit execution is triggered by message submitted by Sync Server to `MESSAGE_TYPE_LIGHTHOUSE_REQUEST` queue. When running locally, use `npm run start:server:lighthouse` to start this server.

## Commands

| Command | Description |
| :--- | :--- |
| `make build.lighthouse` | Build the Lighthouse Server Docker image. |
| `make push.lighthouse` | Push the Lighthouse Server Docker image to GCR. |
| `make start.lighthouse` | Run the Lighthouse Server Docker container, port 5010. This will also mount `/app/src` as a local volume. |
| `make deploy.lighthouse` | Deploy the Lighthouse Server Docker image to Google Cloud. |
| `make describe.lighthouse` | Obtain details about Lighthouse Server service from Google Cloud. |
