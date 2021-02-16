/**
 * External Dependencies.
 */
const { connector } = require('swagger-routes-express');
const express = require('express');
const cors = require('cors');

/**
 * Internal Dependencies.
 */
const { apiSpec } = require('./src/util/apiSpec');
const controllers = require('./src/controllers');
const { setupValidation, handleValidation } = require('./src/util/validation');

const app = express();

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

// Parse application/json
app.use(express.json());

// @todo Add middleware to authenticate requests

// Setup the validation middleware.
app.use(setupValidation());

// Generate the connector.
const connect = connector(controllers, apiSpec(), {});

// Attach the controllers to the routes.
connect(app);

// Capture all the 400 errors.
app.use(handleValidation());

// Capture all the 404 errors.
app.use((req, res) => {
    res.status(404).json({
        message: 'The requested resource does not exists',
        status: 404,
    });
});

exports.tide = app;
