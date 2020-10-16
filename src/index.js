// const { apiMapper } = require( 'openapi-faas-mapper' );
const api = require( './api');
const { connector } = require('swagger-routes-express')
const YAML = require('yamljs')
const express = require('express')
const apiSpec = YAML.load( 'tideapi.yml' );
const app = express();

const bootstrap = () => {
    const apiDefinition = apiSpec
    const connect = connector(api, apiDefinition, {}) // make the connector

    // do any other app stuff, such as wire in passport, use cors etc
    connect(app) // attach the routes

    // add any error handlers last
    return app
}

bootstrap();

exports.TideAPI = app;
