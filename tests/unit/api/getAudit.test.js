const getAudit = require('../../../src/controllers/getAudit');

describe('Main index entry point', () => {
    const res = {
        json: jest.fn(),
    };
    beforeEach(() => {
    });

    describe('Route handler', () => {
        it('Invokes route handler', async () => {
            expect(() => {
                getAudit({ params: {} });
            }).toThrow();
            expect(() => {
                getAudit({
                    params: {
                        type: 'foo',

                    },
                });
            }).toThrow();
            expect(() => {
                getAudit({
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
