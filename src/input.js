/*jslint browser: false*/
'use strict';

var mergeObject = require('./polyfills').mergeObject;
var d3 = require('d3-selection');
var defaults = require('./config.json');
var l10n = require('./l10n');


function Input(config, callback) {
    this.config = Object.create(defaults);
    mergeObject(this.config, config);

    this.local = l10n.locale(this.config.locale);

    d3.select(this.config.ids.input)
        .attr('placeholder', this.local('placeholder'))
        .text('')
        .each(function () {
            this.addEventListener('keydown', callback);
        });
}


function constructor(config, callback) {
    return new Input(config, callback);
}


exports.input = constructor;
