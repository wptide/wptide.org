const schema = require('../../../src/controllers/schema');

jest.mock('../../../src/util/apiSpec',
    () => ({
        apiSpec: () => 'apispec',
    }));

describe('Main index entry point schema', () => {
    const res = {
        json: jest.fn(),
        status(status) { // eslint-disable-line no-unused-vars
            return this; // Make it chainable
        },
    };

    describe('Route handler', () => {
        it('Invokes route handler', async () => {
            expect(async () => {
                await schema(null, res);
            }).not.toThrow();
            expect(res.json).toBeCalledWith('apispec');
        });
    });
});
