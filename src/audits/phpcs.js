const { execSync } = require('child_process');
const fetch = require('node-fetch');

const util = require('util');
const fs = require('fs');
const streamPipeline = util.promisify(require('stream').pipeline);

const download = async (url, path) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`unexpected response ${response.statusText}`);
    await streamPipeline(response.body, fs.createWriteStream(path));
};

const runAudits = async (auditDir) => {
    const path = '/app/vendor/bin/';
    const phpcsPermutataions = [
        { testVersion: '5.6', filename: 'php5.6.json', report: 'version' },
        { testVersion: '7.0', filename: 'php7.0.json', report: 'version' },
        { testVersion: '7.1', filename: 'php7.1.json', report: 'version' },
        { testVersion: '7.2', filename: 'php7.2.json', report: 'version' },
        { testVersion: '7.3', filename: 'php7.3.json', report: 'version' },
        { testVersion: '7.4', filename: 'php7.4.json', report: 'version' },
        // { testVersion: "8.0", filename: "php8.0.json", report: 'version' },
        { testVersion: '5.6-', filename: 'raw.json', report: 'full' },
    ];

    const audit = {
        compatibleVersions: [],
        incompatibleVersions: [],
        raw: null,
    };

    // eslint-disable-next-line no-restricted-syntax
    for (const phpcsParams of phpcsPermutataions) {
        const output = execSync(`${path}phpcs -q -p . --standard=PHPCompatibilityWP --extensions=php --runtime-set testVersion ${phpcsParams.testVersion} --runtime-set ignore_errors_on_exit 1 --runtime-set ignore_warnings_on_exit 1 --report=json`, { cwd: auditDir }).toString();
        const parsedOutput = JSON.parse(output);
        if (phpcsParams.report === 'version') {
            if (parsedOutput.totals.errors === 0) {
                audit.compatibleVersions.push(phpcsParams.testVersion);
            } else {
                audit.incompatibleVersions.push(phpcsParams.testVersion);
            }
        } else if (phpcsParams.report === 'full') {
            audit.raw = parsedOutput;
        }
    }

    return audit;
};

const phpcsAudit = async (settings) => {
    const auditDir = `/tmp/${settings.project_type}/`;
    const downloadFilename = `${settings.slug}.${settings.version}.zip`;
    const url = `https://downloads.wordpress.org/${settings.project_type}/${settings.slug}.${settings.version}.zip`;
    fs.mkdirSync(auditDir, { recursive: true });
    await download(url, `${auditDir}${downloadFilename}`);
    execSync(`unzip ${downloadFilename}`, { cwd: auditDir });
    const audit = await runAudits(auditDir);
    fs.rmdirSync(auditDir, { recursive: true });
    return audit;
};

module.exports = phpcsAudit;
