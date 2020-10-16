const {apiSpec} = require('../util/apiSpec');

const schema = (req, res) => {
    res.json(apiSpec());
}

module.exports = schema;
