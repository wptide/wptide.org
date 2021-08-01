/**
 * External Dependencies.
 */
const nock = require('nock'); // eslint-disable-line import/no-extraneous-dependencies

/**
 * Internal Dependencies.
 */
const { shouldLighthouseAudit } = require('../../../src/util/shouldLighthouseAudit');

/**
 * Generates the API request path.
 *
 * @param   {string} slug Theme slug.
 * @returns {string}      API request path.
 */
const apiPath = (slug) => `/themes/info/1.1/?action=theme_information&request[slug]=${slug}`;

afterAll(() => {
    nock.restore();
});

afterEach(() => {
    nock.cleanAll();
});

/**
 * Tests for shouldLighthouseAudit.
 */
describe('shouldLighthouseAudit', () => {
    it('Returns true when the theme is the most recent version', async () => {
        nock('https://api.wordpress.org')
            .intercept(apiPath('twentytwenty'), 'GET')
            .reply(200, { slug: 'twentytwenty', version: '1.8' });

        expect(await shouldLighthouseAudit({ slug: 'twentytwenty', version: '1.8' })).toBeTruthy();
    });
    it('Returns false when the theme is not the most recent version', async () => {
        nock('https://api.wordpress.org')
            .intercept(apiPath('twentytwenty'), 'GET')
            .reply(200, { slug: 'twentytwenty', version: '1.8' });

        expect(await shouldLighthouseAudit({ slug: 'twentytwenty', version: '1.7' })).toBeFalsy();
    });
    it('Returns false when the API request returns a 404', async () => {
        nock('https://api.wordpress.org')
            .intercept(apiPath('twentytwenty'), 'GET')
            .reply(404);

        expect(await shouldLighthouseAudit({ slug: 'twentytwenty', version: '8' })).toBeFalsy();
    });
    it('Returns false when the API request returns a 500', async () => {
        nock('https://api.wordpress.org')
            .intercept(apiPath('twentytwenty'), 'GET')
            .reply(500);

        expect(await shouldLighthouseAudit({ slug: 'twentytwenty', version: '8' })).toBeFalsy();
    });
    it('Returns false when URL does not exist', async () => {
        const spy = jest.spyOn(console, 'log').mockImplementation();

        nock('https://api.wordpress.org')
            .intercept(apiPath('twentytwenty'), 'GET')
            .replyWithError({
                message: 'some error happened',
                code: 'ENOTFOUND',
            });

        expect(await shouldLighthouseAudit({ slug: 'twentytwenty', version: '8' })).toBeFalsy();
        expect(spy).toBeCalledTimes(1);
        expect(spy.mock.calls[0][0].code).toBe('ENOTFOUND');
        spy.mockRestore();
    });
});
