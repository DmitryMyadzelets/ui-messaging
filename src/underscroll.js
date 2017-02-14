/*jslint browser: false*/
/*global window, HTMLDocument*/
'use strict';

// Element
function e(e) {
    return {
        x: e.scrollLeft,
        y: e.scrollTop,
        h: e.scrollHeight,
        w: e.scrollWidth
    };
}

// Window
function w() {
    return {
        x: window.pageXOffset,
        y: window.pageYOffset,
        h: document.documentElement.scrollHeight,
        w: document.documentElement.scrollWidth
    };
}

// Document, modern
function d() {
    return {
        x: document.documentElement.scrollLeft,
        y: document.documentElement.scrollTop,
        h: document.documentElement.scrollHeight,
        w: document.documentElement.scrollWidth
    };
}

// Document, obsolete
function b() {
    return {
        x: document.body.scrollLeft,
        y: document.body.scrollTop,
        h: document.body.scrollHeight,
        w: document.body.scrollWidth
    };
}


// Returns function for calculating element position
function method(element) {
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


// Return position of the element
function of(element) {
    return of(element)();
}


exports.method = method;
exports.of = of;