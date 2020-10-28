const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

const lighthouseAudit = async (url) => {
    const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
    const options = {
        logLevel: 'error', output: 'json', port: chrome.port,
    };
    const runnerResult = await lighthouse(url, options);

    const reportJson = runnerResult.report;
    const report = JSON.parse(reportJson);
    await chrome.kill();
    return {
        report,
        url: runnerResult.lhr.finalUrl,
        score: runnerResult.lhr.categories.performance.score * 100,
    };
};

module.exports = lighthouseAudit;
