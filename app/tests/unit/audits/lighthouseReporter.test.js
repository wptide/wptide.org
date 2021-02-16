/**
 * Internal Dependencies.
 */
const lighthouse = require('lighthouse');
const lighthouseReporter = require('../../../src/audits/lighthouseReporter');

jest.mock('lighthouse');

beforeEach(() => {
    lighthouse.mockClear();
});

/**
 * Tests for lighthouseReporter.
 */
describe('lighthouseReporter', () => {
    it('Returns the Lighthouse report', async () => {
        lighthouse.mockResolvedValue({
            report: JSON.stringify({ source_url: 'https://wp-themes.com/twentytwenty' }),
        });
        const LH = await lighthouseReporter({ slug: 'twentytwenty' });
        expect(LH).toHaveProperty('source_url');
    });
});
