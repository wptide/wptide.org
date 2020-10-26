const getAudit = require('../../../src/api/getAudit');

describe('Main index entry point', () => {
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
        });
    });
});
