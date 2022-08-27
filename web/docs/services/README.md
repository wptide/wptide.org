# Services

Tide is made up of various public and private microservices hosted on Google Cloud. The 
following describes what each service provides and how it relates to the other services.

## API Server

The API Server is a highly scalable Google Cloud Function that provides the public JSON 
endpoints for the Tide service, which is located at [`/api/v1`](/api/v1) and can be used to 
fetch audits and reports for any version of any WordPress.org plugin or theme.

Additionally, the [Specification](../specification/README.md) page provides a user interface 
for the API Server that you can use to learn about the available endpoints and make various 
HTTP requests. Take some time to familiarize yourself with the API schema, parameters, and 
responses that the wptide.org JSON API provides.

::: tip IMPORTANT

During local development the API Server will be served using the Firebase Emulator. Meaning 
we not run the Function Framework directly like we would with the other services.

:::

### Requesting an audit

When making an HTTP `GET` request to the API Server for a specific audit by version, one of 
two things happens. If the audit already exists, then the API response will contain all the 
stored data about that audit, including the status of the audit and associated report UUID's. 
Alternatively, if an audit doesn't exist then one will be generated and one or more Pub/Sub 
messages will be created that will be processed asynchronously by one of the other services 
and then the resulting JSON reports will be written to Cloud Storage and the status of that 
report will be updated in Firestore for the API Server to then serve back to consumers.

#### Example Request:

    https://wptide.org/api/v1/audit/wporg/theme/twentytwenty/2.0

#### Example Response:

```json
{
    id: "fa84c802226460267323135cf80007da0526c27f226b0276b35df87c0c71af60",
    type: "theme",
    slug: "twentytwenty",
    version: "2.0",
    source_url: "https://downloads.wordpress.org/theme/twentytwenty.2.0.zip",
    created_datetime: 1653421204,
    modified_datetime: 1653421229,
    status: "complete",
    reports: {
        lighthouse: {
            id: "fe91936589c42f98b6b8e73202723ac60cb405dc82876eb936d41cecf68549cb"
        },
        phpcs_phpcompatibilitywp: {
            id: "7aad7d65abaea37872bc063f4f473d111b25429b04c2fb82f3e6fbc14bc0dac7"
        }
    }
}
```

## Report Servers

The Report Servers are Node.js applications running on an Alpine Linux Docker image on
Google Cloud Run. These private event driven service read messages from a Pub/Sub queue 
associated with the relevant Report Server which then runs a CLI to generate a report. These
HTTP event driven services cannot be directly accessed, they are only orchestrated through
Pub/Sub. Meaning the audit report process is **only** triggered by Pub/Sub messages created
to the `MESSAGE_TYPE_LIGHTHOUSE_REQUEST` and `MESSAGE_TYPE_PHPCS_REQUEST` queues. This is
initiated by either the Sync Server, or by making an HTTP `GET` request to the API Server 
for the most recent version of a specific theme or plugin. See the above 
[example request](./#example-request).

Once a report is completed, the generated reports are then stored in Google Cloud 
Storage for later reference and updates are made to Cloud Firestore for the API Server to 
then serve back to consumers.

There are several changes to Firestore that take place in the lifecycle of an audit report.
The first is to find the Status document associated with the audit UUID being processed then
increment the `attempts` for that report type, update when the report process started in the
`start_datetime` property, and set the status to `in-progress`in both the Status document and
the Audit document. Once complete both the Status and Audit documents will again be updated
with a `completed` status, time when completed in the `end_datetime` property, and then store
a reference to the Report document UUID in the Audit document. If the report fails to
complete then the status will be updated to `failed`.

### Lighthouse Server

The Lighthouse Server runs the Google Lighthouse CLI in an instance of headless Chromium 
within Puppeteer. It is important to note that the server only works for wp.org themes, 
**and the most recent version**. This means that the Lighthouse CLI audits each theme by 
loading the demo version found on [wp.org/themes][themes], which is always the latest 
version. So if you request a theme audit for a previous version then a Pub/Sub message will
not be made for the Lighthouse Server to process that theme.

### PHPCS Server

The PHPCS Server runs the [PHP_CodeSniffer CLI][phpcs]. Currently, it only supports 
executing the `phpcs` command for each defined PHP version ("5.6", "7.0", "7.1", "7.2", 
"7.3", "7.4" or "8.0") which scans for errors in a given plugin or theme `ZIP` archive 
against the `PHPCompatibilityWP` coding standards and merges the results into a single 
report.

It is important to note that the PHPCS Server only does static analysis of PHP compatibility,
and eventually WordPress coding standards, and does not execute code or install themes and 
plugins into WordPress to run the audit report.

## Sync Server

The Sync Server is also a Node.js applications running on an Alpine Linux Docker image on
Google Cloud Run. The server makes scheduled requests, using Cloud Scheduler, to the 
WordPress.org Themes and Plugins API's to determine which themes and plugins have changed 
since the last scheduled request. During execution messages are added to a Pub/Sub queue 
associated by report type for one of the above Report Servers to asynchronously process.

The sync process is triggered by a Google Cloud scheduler job where Pub/Sub messages are 
submitted every 5 minutes to the `MESSAGE_TYPE_SYNC_REQUEST` queue which initiates a single
Cloud Run instance of the Sync Server.

[themes]: https://wordpress.org/themes
[phpcs]: https://github.com/squizlabs/PHP_CodeSniffer
