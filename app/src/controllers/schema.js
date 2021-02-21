/**
 * Internal Dependencies.
 */
const apiValidate = require('../util/apiValidate');

/**
 * Renders the API schema.
 *
 * @param {object} req The HTTP request.
 * @param {object} res The HTTP response.
 */
const schema = async (req, res) => {
    const api = await apiValidate();
    const status = api.status ? api.status : 200;
    res.set('Cache-control', status === 200 ? 'public, max-age=86400' : 'no-store');
    res.status(status).json(api);
};

module.exports = schema;
