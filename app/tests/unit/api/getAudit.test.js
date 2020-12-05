const getAudit = require('../../../src/controllers/getAudit');

jest.mock('../../../src/integrations/datastore');

describe('Main index entry point getAudit', () => {
    const res = {
        json: jest.fn(),
        status(status) { // eslint-disable-line no-unused-vars
            return this; // Make it chainable
        },
    };
    beforeEach(() => {
        jest.mock('../../../src/integrations/datastore');
    });

    describe('Route handler', () => {
        it('Invokes route handler', async () => {
            let errorMessage;
            try {
                await getAudit({ params: {} });
            } catch (error) {
                errorMessage = error.message;
            }
            expect(errorMessage).toEqual('Project type missing');

            try {
                await getAudit({ params: { type: 'foo' } });
            } catch (error) {
                errorMessage = error.message;
            }
            expect(errorMessage).toEqual('Project type should be theme or plugin');

            expect(async () => {
                await getAudit({
                    params: {
                        type: 'theme',
                        slug: 'fooslug',
                        version: '1',
                    },
                }, res);
            }).not.toThrow();
        });
    });
});
