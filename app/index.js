/**
 * External Dependencies.
 */
const functions = require('firebase-functions');

/**
 * Internal Dependencies.
 */
const api = require('./api');
const spec = require('./spec');

// Export the functions.
exports.api = functions.https.onRequest(api);
exports.spec = functions.https.onRequest(spec);
