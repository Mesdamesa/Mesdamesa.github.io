/**
 * analytics.js
 * Centralised Google Analytics (gtag) + Axeptio cookie consent.
 * Included once in every page via a single <script src="...analytics.js"> tag.
 * DO NOT duplicate this logic inline in individual HTML files.
 */

// ── Google Analytics ──────────────────────────────────────────────────────────
window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
gtag('js', new Date());
gtag('config', 'G-MBBDMBMJEW', { anonymize_ip: true });

// ── Axeptio Cookie Consent ────────────────────────────────────────────────────
window.axeptioSettings = {
    clientId: '662665f16e157af438f3e17e',
    cookiesVersion: 'mesdames-a-fr-EU',
};
(function (d, s) {
    var t = d.getElementsByTagName(s)[0], e = d.createElement(s);
    e.async = true;
    e.src = '//static.axept.io/sdk.js';
    t.parentNode.insertBefore(e, t);
})(document, 'script');
