# PHPCS Server

The PHPCS Server is a Node.js app running on an Alpine Linux Docker image that reads messages from a queue and runs PHPCS reports against both plugins and themes. It is important to note that the PHPCS Server only does static analysis of PHP compatibility and WordPress coding standards and does not execute code or install themes and plugins into WordPress to run the audit.

The Node.js app execute a `phpcs` command in a child process to scan the given plugin or theme against `PHPCompatibilityWP` coding standards, for each defined PHP version separately (either "5.6", "7.0", "7.1", "7.2", "7.3", "7.4" or "8.0").

Once completed, the Node.js app creates two new files in Firestore: one for Audit and one for Report. It also updates the Status file, modifying status (which now can be either "completed" or "failed") and relevant datetime fields.

This audit execution is triggered by message submitted by Sync Server to `MESSAGE_TYPE_PHPCS_REQUEST` queue. When running locally, use `npm run start:server:phpcs` to start this server.

## Commands

| Command | Description |
| :--- | :--- |
| `make build.phpcs` | Build the PHPCS Server Docker image. |
| `make push.phpcs` | Push the PHPCS Server Docker image to GCR. |
| `make start.phpcs` | Run the PHPCS Server Docker container, port 5011. This will also mount `/app/src` as a local volume. |
| `make deploy.phpcs` | Deploy the PHPCS Server Docker image to Google Cloud. |
| `make describe.phpcs` | Obtain details about PHPCS Server service from Google Cloud. |
