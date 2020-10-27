const getAudit = require('../../../src/api/getAudit');

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
                        project_type: 'foo',

                    },
                });
            }).toThrow();
            expect(() => {
                getAudit({
                    params: {
                        project_type: 'theme',
                        project_slug: 'fooslug',
                        version: '1',
                    },
                }, res);
            }).not.toThrow();
        });
    });
});
