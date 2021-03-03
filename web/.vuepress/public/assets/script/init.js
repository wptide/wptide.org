/**
 * Load an array of scripts in order.
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
        '/__/firebase/8.2.9/firebase-app.js',
        '/__/firebase/8.2.9/firebase-analytics.js',
        '/__/firebase/8.2.9/firebase-firestore.js',
        '/__/firebase/8.2.9/firebase-performance.js',
        '/__/firebase/init.js',
    ];
    /* eslint-disable-next-line no-restricted-syntax */
    for await (const script of scripts) {
        await loadScript(script);
    }
})();
