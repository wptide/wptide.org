const { exec } = require('child_process');
const fetch = require('node-fetch');

const util = require('util');
const fs = require('fs');
// const yauzl = require('yauzl');
const streamPipeline = util.promisify(require('stream').pipeline);

const outputDir = '/tmp/output/';
const auditDir = '/tmp/audit/';
const filename = 'project.zip';

const download = async (url, path) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`unexpected response ${response.statusText}`);
    await streamPipeline(response.body, fs.createWriteStream(path));
};

/*
const unzip = async (path) => {
    const promise = new Promise((resolve, reject) => {
        yauzl.open(path, { lazyEntries: true }, (err, zipfile) => {
            if (err) {
                reject();
                throw err;
            }
            zipfile.readEntry();
            zipfile.on('entry', (entry) => {
                if (/\/$/.test(entry.fileName)) {
                    // directory file names end with '/'
                    fs.mkdirSync(entry.fileName, { recursive: true });
                } else {
                    // file entry
                    zipfile.openReadStream(entry, (readErr, readStream) => {
                        // ensure parent directory exists
                        fs.mkdirSync(path.dirname(entry.fileName), { recursive: true });
                        if (readErr) {
                            reject();
                            throw readErr;
                        }
                        readStream.pipe(fs.createWriteStream(entry.fileName));
                        readStream.on('end', () => {
                            zipfile.readEntry();
                        });
                    });
                }
            }).on('close', () => resolve());
        });
    });

    await promise;
};
 */

const runAudits = async () => {
    const path = '/Users/ivan/projects/ofm/tide-faas/phpcs/vendor/bin/'; // Remove me
    const phpcsPermutataions = [
        { testVersion: '5.6-', filename: 'raw.json' },
        { testVersion: '5.6', filename: 'php5.6.json' },
        { testVersion: '7.0', filename: 'php7.0.json' },
        { testVersion: '7.1', filename: 'php7.1.json' },
        { testVersion: '7.2', filename: 'php7.2.json' },
        { testVersion: '7.3', filename: 'php7.3.json' },
        { testVersion: '7.4', filename: 'php7.4.json' },
        // { testVersion: "8.0", filename: "php8.0.json" },
    ];

    // eslint-disable-next-line no-restricted-syntax
    for (const phpcsParams of phpcsPermutataions) {
        // eslint-disable-next-line no-await-in-loop
        await exec(`${path}phpcs -q -p . --standard=PHPCompatibilityWP --extensions=php --runtime-set testVersion ${phpcsParams.testVersion} --report=json > ${outputDir}${phpcsParams.filename}`, { cwd: auditDir });
    }
};

const phpcsAudit = async (settings) => {
    const url = `https://downloads.wordpress.org/${settings.project_type}/${settings.slug}.${settings.version}.zip`;
    fs.mkdirSync(auditDir, { recursive: true });
    fs.mkdirSync(outputDir, { recursive: true });
    await download(url, `${auditDir}${filename}`);
    await exec(`unzip ${filename}`, { cwd: auditDir });
    await runAudits();
    return {
        settings,
    };
};

module.exports = phpcsAudit;
