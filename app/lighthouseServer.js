/**
 * Internal Dependencies.
 */
const { lighthouseServer } = require('./src/run/lighthouseServer');

// Exports the Lighthouse Cloud Run server to the `tide` namespace.
exports.tide = async (req, res) => lighthouseServer(req, res);
