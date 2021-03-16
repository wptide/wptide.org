/**
 * Internal Dependencies.
 */
const { setAuditStatus } = require('../../../src/util/setAuditStatus');

const mockStatusDoc = () => ({
    reports: {
        lighthouse: {
            attempts: 0,
            end_datetime: null,
            start_datetime: null,
            status: 'pending',
        },
        phpcs_phpcompatibilitywp: {
            attempts: 0,
            end_datetime: null,
            start_datetime: null,
            status: 'pending',
        },
    },
});

/**
 * Tests for setAuditStatus.
 */
describe('setAuditStatus', () => {
    it('The audit status should be pending', async () => {
        const statusDoc = mockStatusDoc();
        statusDoc.status = setAuditStatus(statusDoc);
        expect(statusDoc.status).toBe('pending');
    });
    it('The audit status should be failed', async () => {
        const statusDoc = mockStatusDoc();
        statusDoc.reports.lighthouse.status = 'failed';
        statusDoc.status = setAuditStatus(statusDoc);
        expect(statusDoc.status).toBe('failed');
    });
    it('The audit status should be complete', async () => {
        const statusDoc = mockStatusDoc();
        statusDoc.reports.lighthouse.status = 'complete';
        statusDoc.reports.phpcs_phpcompatibilitywp.status = 'complete';
        statusDoc.status = setAuditStatus(statusDoc);
        expect(statusDoc.status).toBe('complete');
    });
    it('The audit status should be in-progress', async () => {
        const statusDoc = mockStatusDoc();
        statusDoc.reports.lighthouse.status = 'in-progress';
        statusDoc.status = setAuditStatus(statusDoc);
        expect(statusDoc.status).toBe('in-progress');
    });
});
