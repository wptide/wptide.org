/**
 * External Dependencies.
 */
const { connector } = require('swagger-routes-express');
const YAML = require('yamljs');
const express = require('express');

/**
 * Internal Dependencies.
 */
const controllers = require('./src/controllers');

const apiSpec = YAML.load('openapi.yml');
const app = express();

const bootstrap = () => {
    const connect = connector(controllers, apiSpec, {}); // make the connector

    // do any other app stuff, such as wire in passport, use cors etc
    connect(app); // attach the routes

    // add any error handlers last
    return app;
};

bootstrap();

exports.TideAPI = app;
