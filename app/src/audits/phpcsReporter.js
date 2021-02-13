/**
 * Internal Dependencies.
 */
const { phpcsDownloader, phpcsRemover, phpcsProcessor } = require('../util/phpcsHelpers');
const { getAuditId } = require('../util/identifiers');

/**
 * Generates a PHPCS PHPCompatibilityWP report.
 *
 * @param {object} message The Pub/Sub message.
 * @returns {object} The report data.
 */
const phpcsReporter = async (message) => {
    // @todo handle missing message params.
    const parentDir = `/tmp/${getAuditId(message)}/`;
    const reportDir = `${parentDir}${message.slug}/`;
    const downloadFilename = `${message.slug}.${message.version}.zip`;
    const url = `https://downloads.wordpress.org/${message.type}/${message.slug}.${message.version}.zip`;

    // Download & unzip the archive.
    await phpcsDownloader(url, parentDir, downloadFilename);

    // Process the report.
    const data = phpcsProcessor(url, reportDir, process.cwd());

    // Remove directory.
    phpcsRemover(reportDir);

    return data;
};

module.exports = phpcsReporter;
