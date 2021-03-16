/* global firebase */

/**
 * Load a single script and return a resolved promise.
 *
 * @param   {string} url URL to the JS file.
 * @returns {*}          Resolved promises.
 */
const loadScript = async (url) => Promise.resolve(new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = url;

    if (window.location.hostname === 'localhost') {
        script.src += '?useEmulator=true';
    }

    script.addEventListener('load', () => {
        resolve(true);
    });

    document.head.appendChild(script);
}));

(async () => {
    const scripts = [
        '/__/firebase/8.3.0/firebase-app.js',
        '/__/firebase/8.3.0/firebase-analytics.js',
        '/__/firebase/8.3.0/firebase-firestore.js',
        '/__/firebase/8.3.0/firebase-performance.js',
        '/__/firebase/init.js',
    ];
    /* eslint-disable-next-line no-restricted-syntax */
    for await (const script of scripts) {
        await loadScript(script);
    }

    // Initialize Firebase Analytics.
    firebase.analytics();
})();
