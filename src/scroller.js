/*jslint browser: false*/
/*global window, HTMLDocument*/
'use strict';

// Element of DOM
var e = {
    get: function (e) {
        return {
            x: e.scrollLeft,
            y: e.scrollTop,
            h: e.scrollHeight,
            w: e.scrollWidth
        };
    },
    top: function (e, v) {
        e.scrollTop = v;
    }
};

// Window
var w = {
    get: function () {
        return {
            x: window.pageXOffset,
            y: window.pageYOffset,
            h: document.documentElement.scrollHeight,
            w: document.documentElement.scrollWidth
        };
    },
    top: function (ignore, v) {
        document.documentElement.scrollTop = v;
    }
};

// Document, modern
var d = {
    get: function () {
        return {
            x: document.documentElement.scrollLeft,
            y: document.documentElement.scrollTop,
            h: document.documentElement.scrollHeight,
            w: document.documentElement.scrollWidth
        };
    },
    top: function (ignore, v) {
        document.documentElement.scrollTop = v;
    }
};

// Document, obsolete
var b = {
    get: function () {
        return {
            x: document.body.scrollLeft,
            y: document.body.scrollTop,
            h: document.body.scrollHeight,
            w: document.body.scrollWidth
        };
    },
    top: function (ignore, v) {
        document.body.scrollTop = v;
    }
};


// Returns object with methods appropriate to the element
function choose(element) {
    // if (window || document)
    if (element.document || element instanceof HTMLDocument) {
        // https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollY
        if (window.pageXOffset !== undefined) {
            return w;
        }
        if ((document.compatMode || "") === "CSS1Compat") {
            return d;
        }
        return b;
    }
    return e;
}


function of(element) {
    return choose(element);
}


function bind(element) {
    var parent = choose(element),
        o = Object.create(parent),
        k = Object.keys(parent),
        n = k.length,
        i;
    for (i = 0; i < n; i += 1) {
        o[k[i]] = o[k[i]].bind(o, element);
    }
    return o;
}


exports.of = of;
exports.bind = bind;