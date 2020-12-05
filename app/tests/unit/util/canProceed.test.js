/**
 * Internal Dependencies.
 */
const { canProceed } = require('../../../src/util/canProceed');

/**
 * Tests for getSourceUrl.
 */
describe('canProceed', () => {
    it('requires the correct parameters for invocation', async () => {
        let errorMessage;

        try {
            await canProceed();
        } catch (error) {
            errorMessage = error.message;
        }
        expect(errorMessage).toEqual('type param missing');

        try {
            await canProceed('lighthouse', {});
        } catch (error) {
            errorMessage = error.message;
        }
        expect(errorMessage).toEqual('item.slug param missing');

        try {
            await canProceed('lighthouse', { slug: 'stream' });
        } catch (error) {
            errorMessage = error.message;
        }
        expect(errorMessage).toEqual('item.version param missing');

        // @TODO test actual functionality
    });
});
