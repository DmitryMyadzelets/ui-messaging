/*jslint browser: false*/
'use strict';

var config = require('./l10n.json');

function l10n(key) {
    var locale = this;
    return config[key][locale] || config.l10n[key][undefined];
}

function constructor(locale) {
    return l10n.bind(locale);
}

exports.locale = constructor;