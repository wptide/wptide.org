/**
 * Internal Dependencies.
 */
const { shouldLighthouseAudit } = require('../../../src/util/shouldLighthouseAudit');

/**
 * Tests for shouldLighthouseAudit.
 */
describe('shouldLighthouseAudit', () => {
    it('Returns true for the TwentyTwenty theme v2.0', async () => {
        expect(await shouldLighthouseAudit({ slug: 'twentytwenty', version: '2.0' })).toBe(true);
    });
    it('Returns false for the TwentyTwenty theme v1.5', async () => {
        expect(await shouldLighthouseAudit({ slug: 'twentytwenty', version: '1.5' })).toBe(false);
    });
});
