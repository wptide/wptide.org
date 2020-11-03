const lighthouse = require('../../audits/lighthouse');

const runAudit = async (themeName) => {
    const url = `https://wp-themes.com/${themeName.replace(/[^\w.-]+/g, '')}/`;
    const audit = await lighthouse(url);
    return audit;
};

const notifyAuditResults = async (id, audit) => {
    console.log(id); // eslint-disable-line no-console
    console.log(audit); // eslint-disable-line no-console
};

exports.lighthouseAudit = async (data, context) => {
    console.log(data); // eslint-disable-line no-console
    console.log(context); // eslint-disable-line no-console
    const message = JSON.parse(Buffer.from(context.message.data, 'base64').toString('ascii'));
    if (!!message.id && !!message.slug) {
        const audit = await runAudit(message.slug);
        await notifyAuditResults(message.id, audit);
    }
};
