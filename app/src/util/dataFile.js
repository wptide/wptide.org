/**
 * External Dependencies.
 */
const fs = require('fs').promises;

/**
 * Store the report to a local file.
 *
 * @param   {string}        filename The name of the file to store.
 * @param   {object}        data     The data to store in the file.
 * @returns {Promise<void>}
 */
const writeFile = async (filename, data) => fs.writeFile(`${process.cwd()}/data/${filename}`, JSON.stringify(data));

/**
 * Read the report from a local file.
 *
 * @param   {string}          filename The name of the file to read.
 * @returns {Promise<string>}          The stringified JSON data stored in the file.
 */
const readFile = async (filename) => fs.readFile(`${process.cwd()}/data/${filename}`, 'utf8');

/**
 * Delete the report from the local filesystem.
 *
 * @param   {string}        filename The name of the file to unlink.
 * @returns {Promise<void>}
 */
const unlink = async (filename) => fs.unlink(`${process.cwd()}/data/${filename}`);

module.exports = {
    writeFile,
    readFile,
    unlink,
};
