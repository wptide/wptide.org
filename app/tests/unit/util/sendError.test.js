/**
 * Internal Dependencies.
 */
const { sendError } = require('../../../src/util/sendError');

global.console.log = jest.fn();

const mock = {
    res: () => ({
        send: jest.fn(),
        status(status) { // eslint-disable-line no-unused-vars
            return this; // Make it chainable
        },
    }),
};

/**
 * Tests for sendError.
 */
describe('sendError', () => {
    it('The response function is called.', async () => {
        const res = mock.res();
        await sendError(res, 'error', null);
        expect(res.send).toBeCalledTimes(1);
    });

    it('The error message is set.', async () => {
        const res = mock.res();
        await sendError(res, 'error', 500);
        expect(res.send).toBeCalledTimes(1);
        expect(global.console.log).toBeCalledWith('error');
    });
});
