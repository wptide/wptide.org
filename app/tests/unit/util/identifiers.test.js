/**
 * Internal Dependencies.
 */
const { getAuditId, getHash, getProjectId } = require('../../../src/util/identifiers');

/**
 * Tests for identifiers.
 */
describe('Tests for identifiers', () => {
    it('getAuditId returns a valid audit ID', () => {
        expect(getAuditId({ type: 'theme', slug: 'twentytwenty', version: '1.6' })).toBe('01aeced35125e34401a3e23dc6dd8ea064b14af48eaf47ff1be8d97a9a9038a3');
    });
    it('getProjectId returns a valid project ID', () => {
        expect(getProjectId({ type: 'theme', slug: 'twentytwenty', version: '1.6' })).toBe('80c83251c736a2b6744eb40c6c4071dbb7cd80fa041f680a9872cb3844754c03');
    });
    it('getHash returns a valid hash ID from string', () => {
        expect(getHash('themetwentytwenty1.6')).toBe('01aeced35125e34401a3e23dc6dd8ea064b14af48eaf47ff1be8d97a9a9038a3');
    });
    it('getHash returns a valid hash ID from object, which should never be used', () => {
        expect(getHash({ type: 'theme', slug: 'twentytwenty', version: '1.6' })).toBe('4bb1a145402a9386bd8436120d17c9a4843a890e2c4ed9d88b423ff2513ff6f5');
    });
});
