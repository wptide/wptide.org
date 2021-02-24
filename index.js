/**
 * External Dependencies.
 */
const dotenv = require('dotenv');

// Load `.env` file.
dotenv.config();

// Move into the `app` directory for the correct context.
process.chdir('app');

// Local development only, simply bootstraps the various services dynamically.
exports.tide = async (req, res) => require(process.env.SERVER_PATH).tide(req, res); // eslint-disable-line
