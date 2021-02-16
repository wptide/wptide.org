/**
 * External Dependencies.
 */
const fetch = require('node-fetch');
const util = require('util');
const fs = require('fs');
const stream = require('stream');

/**
 * Downloads a zip file.
 *
 * @param   {string}        url  The URL to the archive.
 * @param   {string}        path The absolute path to on the server.
 * @returns {Promise<void>}
 */
const download = async (url, path) => {
    const streamPipeline = util.promisify(stream.pipeline);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`unexpected response ${response.statusText}`); // @todo handle error.
    await streamPipeline(response.body, fs.createWriteStream(path));
};

module.exports = {
    download,
};
