// const { exec } = require('child_process');
const fetch = require('node-fetch');
const mkdirp = require('mkdirp');

const util = require('util');
const fs = require('fs');
const streamPipeline = util.promisify(require('stream').pipeline);

const outputDir = '/tmp/output/';
const auditDir = '/tmp/audit/';
const filename = 'project.zip';

const download = async (url, path) => {
    console.log(url);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`unexpected response ${response.statusText}`);
    await streamPipeline(response.body, fs.createWriteStream(path));
};

const unzip = async (path) => {
    
}

const phpcsAudit = async (settings) => {
    const url = `https://downloads.wordpress.org/${settings.project_type}/${settings.slug}.${settings.version}.zip`;
    await mkdirp(auditDir);
    await mkdirp(outputDir);
    await download(url, `${auditDir}${filename}`);
    await unzip(url, `${auditDir}${filename}`);
    return {
        settings,
    };
};

module.exports = phpcsAudit;
