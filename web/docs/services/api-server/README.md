# API Server

The API Server is a Firebase Function that provides the public JSON endpoints for the Tide service, which is located at `/api/v1` and can be used to fetch audits and reports for any version of any WordPress plugin or theme.

The [Specification](../../specification/README.md) page provides a user interface for the API Server that you can use to learn about the available endpoints and make various requests. Take some time to familiarize yourself with the API schema, parameters, and responses that the wptide.org JSON API provides.

## Commands

| Command | Description |
| :--- | :--- |
| `make deploy.api` | Deploy the API function to Google Cloud. |
