const { description } = require('../../package');

module.exports = {
    /**
     * Ref：https://v1.vuepress.vuejs.org/config/#title
     */
    title: 'Tide',

    /**
     * Ref：https://v1.vuepress.vuejs.org/config/#description
     */
    description,

    /**
     * Ref: https://v1.vuepress.vuejs.org/config/#port
     */
    port: 8000,

    /**
     * Extra tags to be injected to the page HTML `<head>`
     *
     * ref：https://v1.vuepress.vuejs.org/config/#head
     */
    head: [
        ['link', { rel: 'apple-touch-icon', sizes: '57x57', href: '/assets/favicons/apple-icon-57x57.png' }],
        ['link', { rel: 'apple-touch-icon', sizes: '60x60', href: '/assets/favicons/apple-icon-60x60.png' }],
        ['link', { rel: 'apple-touch-icon', sizes: '72x72', href: '/assets/favicons/apple-icon-72x72.png' }],
        ['link', { rel: 'apple-touch-icon', sizes: '76x76', href: '/assets/favicons/apple-icon-76x76.png' }],
        ['link', { rel: 'apple-touch-icon', sizes: '114x114', href: '/assets/favicons/apple-icon-114x114.png' }],
        ['link', { rel: 'apple-touch-icon', sizes: '120x120', href: '/assets/favicons/apple-icon-120x120.png' }],
        ['link', { rel: 'apple-touch-icon', sizes: '144x144', href: '/assets/favicons/apple-icon-144x144.png' }],
        ['link', { rel: 'apple-touch-icon', sizes: '152x152', href: '/assets/favicons/apple-icon-152x152.png' }],
        ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: '/assets/favicons/apple-icon-180x180.png' }],
        ['link', {
            rel: 'icon', type: 'image/png', sizes: '192x192', href: '/assets/favicons/android-icon-192x192.png',
        }],
        ['link', {
            rel: 'icon', type: 'image/png', sizes: '16x16', href: '/assets/favicons/favicon-16x16.png',
        }],
        ['link', {
            rel: 'icon', type: 'image/png', sizes: '32x32', href: '/assets/favicons/favicon-32x32.png',
        }],
        ['link', {
            rel: 'icon', type: 'image/png', sizes: '96x96', href: '/assets/favicons/favicon-96x96.png',
        }],
        ['link', { rel: 'manifest', href: '/manifest.json' }],
        ['meta', { name: 'theme-color', content: '#ffffff' }],
        ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
        ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }],
        ['link', { rel: 'mask-icon', href: '/assets/img/logo.svg', color: '#ffffff' }],
        ['meta', { name: 'msapplication-TileImage', content: '/assets/favicons/ms-icon-144x144.png' }],
        ['meta', { name: 'msapplication-TileColor', content: '#000000' }],
        ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1' }],
        ['meta', { property: 'og:image', content: '/assets/img/tide-wp.png' }],
        ['script', { src: '/assets/script-loader.js' }],
    ],

    /**
     * Theme configuration, here is the default theme configuration for VuePress.
     *
     * ref：https://v1.vuepress.vuejs.org/theme/default-theme-config.html
     */
    themeConfig: {
        repo: 'wptide/wptide.org',
        editLinks: true,
        lastUpdated: true,
        docsDir: 'web',
        docsBranch: 'develop',
        logo: '/assets/img/logo.svg',
        nav: [
            {
                text: 'Docs',
                link: '/docs/',
            },
            {
                text: 'WordPress.org',
                link: 'https://make.wordpress.org/tide/',
                target: '_blank',
            },
        ],
        sidebar: {
            '/docs/': [
                {
                    title: '',
                    collapsable: false,
                    children: [
                        '',
                        'services/',
                        'installation/',
                        'google-cloud/',
                    ],
                },
                {
                    title: '',
                    collapsable: false,
                    children: [
                        ['contributing/', 'Contributing'],
                        'code-of-conduct/',
                        'roadmap/',
                        'sponsors/',
                    ],
                },
                {
                    title: 'API v1',
                    collapsable: false,
                    children: [
                        ['specification/', 'Specification'],
                        'status/',
                    ],
                },
            ],
        },
    },

    /**
     * Apply plugins，ref：https://v1.vuepress.vuejs.org/zh/plugin/
     */
    plugins: [
        '@vuepress/plugin-back-to-top',
        [
            '@vuepress/plugin-pwa',
            {
                serviceWorker: true,
                updatePopup: true,
            },
        ],
        [
            '@vuepress/last-updated',
            {
                transformer: (timestamp, lang) => new Date(timestamp).toLocaleDateString(lang, {
                    year: '2-digit',
                    month: 'numeric',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    timeZoneName: 'short',
                }),
            },
            true,
        ],
    ],

    extend: '@vuepress/theme-default',
};
