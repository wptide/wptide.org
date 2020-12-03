/**
 * External Dependencies.
 */
const { execSync } = require('child_process');
const { sep } = require('path');
const fs = require('fs');
const os = require('os');

/**
 * Internal Dependencies.
 */
const { download } = require('../util/download');

/**
 * Generates a PHPCS PHPCompatibilityWP report.
 *
 * @param {object} message The Pub/Sub message.
 * @returns {object} The report data.
 */
const phpcsReporter = async (message) => {
    // @todo handle missing message params.
    const parentDir = `${os.tmpdir()}${sep}${message.type}${sep}`;
    const reportDir = `${parentDir}${message.slug}${sep}`;
    const downloadFilename = `${message.slug}.${message.version}.zip`;
    const url = `https://downloads.wordpress.org/${message.type}/${message.slug}.${message.version}.zip`;

    const phpcsPermutations = [
        { testVersion: '5.6', filename: 'php5.6.json', report: 'version' },
        { testVersion: '7.0', filename: 'php7.0.json', report: 'version' },
        { testVersion: '7.1', filename: 'php7.1.json', report: 'version' },
        { testVersion: '7.2', filename: 'php7.2.json', report: 'version' },
        { testVersion: '7.3', filename: 'php7.3.json', report: 'version' },
        { testVersion: '7.4', filename: 'php7.4.json', report: 'version' },
        // { testVersion: "8.0", filename: "php8.0.json", report: 'version' },
        { testVersion: '5.6-', filename: 'raw.json', report: 'full' },
    ];

    const data = {
        source_url: url,
        server: {
            node: execSync('node --version').toString().match(/\d+(\.\d+)+/g)[0],
            php: execSync('php --version').toString().match(/\d+(\.\d+)+/g)[0],
            dependencies: [
                {
                    vendor: 'squizlabs/php_codesniffer',
                    version: execSync('/app/vendor/bin/phpcs -q --version').toString().match(/\d+(\.\d+)+/g)[0],
                },
                {
                    vendor: 'phpcompatibility/phpcompatibility-wp',
                    version: '2.1.0',
                },
            ],
        },
        // Set the report.
        report: {
            compatible_versions: [],
            incompatible_versions: [],
            files: null,
            totals: null,
        },
    };

    // Download & unzip the archive.
    fs.mkdirSync(parentDir, { recursive: true });
    await download(url, `${parentDir}${downloadFilename}`);
    execSync(`unzip ${downloadFilename}`, { cwd: parentDir });

    // Generate & store PHPCS reports.
    phpcsPermutations.forEach((phpcsParams) => {
        const output = execSync(`/app/vendor/bin/phpcs -q -p . --standard=PHPCompatibilityWP --extensions=php --runtime-set testVersion ${phpcsParams.testVersion} --runtime-set ignore_errors_on_exit 1 --runtime-set ignore_warnings_on_exit 1 --report=json`, { cwd: reportDir }).toString();
        const parsedOutput = JSON.parse(output);
        if (phpcsParams.report === 'version') {
            if (parsedOutput.totals.errors === 0) {
                data.report.compatible_versions.push(phpcsParams.testVersion);
            } else {
                data.report.incompatible_versions.push(phpcsParams.testVersion);
            }
        } else if (phpcsParams.report === 'full') {
            // Remove the file path.
            Object.keys(parsedOutput.files).forEach((key) => {
                const newKey = key.replace(reportDir, '');
                parsedOutput.files[newKey] = parsedOutput.files[key];
                delete parsedOutput.files[key];
            });
            data.report.files = parsedOutput.files;
            data.report.totals = parsedOutput.totals;
        }
    });

    // Remove directory.
    fs.rmdirSync(reportDir, { recursive: true });

    return data;
};

module.exports = phpcsReporter;
