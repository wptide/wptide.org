/**
 * External Dependencies.
 */
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const yaml = require('js-yaml');
const path = require('path');
const fs = require('fs');

/**
 * Internal Dependencies.
 */
const api = path.resolve(__dirname, './openapi.yml');

const app = express();

app.use((req, res, next) => {
    res.set('Cache-control', 'public, max-age=300');
    next();
});

app.use('/api/spec/v1/assets', express.static(path.join(__dirname, 'public')));

const options = {
    customCssUrl: './assets/css/style.css',
    customSiteTitle: 'Tide OpenAPI Specification',
    customfavIcon: './assets/images/favicon.ico',
};

app.use('/api/spec/v1', swaggerUi.serve, swaggerUi.setup(yaml.load(fs.readFileSync(api, 'utf8')), options));

exports.docs = app;
