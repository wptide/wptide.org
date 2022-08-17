# Services

Tide consists of the following services:

* The [API Server](./api-server/) provides the public JSON endpoints for the Tide service.
* The [Sync Server](./sync-server/) polls the WordPress.org API’s for themes and plugins to process and writes them to a queue.
* The [PHPCS Server](./phpcs-server/) reads messages from a queue and runs reports against both plugins and themes, then writes the results to the Firestore.
* The [Lighthouse Server](./lighthouse-server/) reads messages from a queue and runs Google Lighthouse reports against the themes only, then writes the results to the Firestore.

## Queues

There are three Pub/Sub topics created in Google Cloud:

| Topic | Description |
| :--- | :--- |
| `MESSAGE_TYPE_LIGHTHOUSE_REQUEST` | Triggers Lighthouse Server to run Audit against given theme. Message is submitted to queue by the Sync Server. |
| `MESSAGE_TYPE_PHPCS_REQUEST` | Triggers PHPCS Server to run Audit against given plugin or theme. Message is submitted to queue by the Sync Server. |
| `MESSAGE_TYPE_SYNC_REQUEST` | Triggers Sync Server to do the sync routine. Message is submitted to queue every 5 minutes by Google Cloud scheduler job. |
