/*jslint browser: false*/
'use strict';

var d3 = Object.assign(require('d3-selection'));
var defaults = require('./config.json');
var l10n = require('./l10n');


function Input(config, callback) {
    this.config = Object.create(defaults);
    Object.assign(this.config, config);

    this.local = l10n.locale(this.config.locale);

    d3.select(this.config.ids.input)
        .attr('placeholder', this.local('placeholder'))
        .text('')
        .on('keydown', function () {
            callback.call(this, d3.event);
        });
}

function constructor(config, callback) {
    return new Input(config, callback);
}

exports.input = constructor;