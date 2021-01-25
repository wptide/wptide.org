/**
 * Internal Dependencies.
 */
const { apiSpec } = require('../util/apiSpec');

/**
 * Renders the API schema.
 *
 * @param {object} req The HTTP request.
 * @param {object} res The HTTP response.
 */
const schema = (req, res) => {
    res.json(apiSpec());
};

module.exports = schema;
