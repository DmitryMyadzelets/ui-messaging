module.exports = function (html) {
    'use strict';
    return html
        .replace(/(&nbsp;)+/gi, ' ') // Get back normal spaces
        .replace(/\s+(<br>)/g, '\$1') // Remove spaces before <br>
        .replace(/(<br>)\s+/g, '\$1') // Remove spaces after <br>
        .replace(/\s{2,}/g, ' ') // Replace multiple spaces with one
        .replace(/^(<br>)*/i, '') // Remove <br> at the beginning
        .replace(/(<br>)*$/i, '') // ... and at the end
        .replace(/(<br>){3,}/gi, '<br><br>'); // No more then two <br>
};