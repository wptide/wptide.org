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

    // @todo if 429 Too Many Requests try again or put it back in the queue.

    /* istanbul ignore next */
    if (!response.ok) throw new Error(`unexpected response ${response.statusText}`);
    await streamPipeline(response.body, fs.createWriteStream(path));
};

module.exports = {
    download,
};
