/*jslint browser: false*/
'use strict';

var messaging = require('./index.js');
var shortId = require('shortid');
var lipsum = require('lorem-ipsum');
var tidy = require('./tidy-input');
var d3 = Object.assign(require('d3-selection'), require('d3-timer'));


var authors = ['Alice', 'Bob', 'Lorem Ipsum'];
var nMessages = 20; // Number of messages


function emptyMessage() {
    return {
        // id is used as a DOM element id
        // so it [can't start with a number](https://www.w3.org/TR/CSS21/syndata.html#value-def-identifier)
        // We add _ to make selectors work
        id: '_' + shortId.generate()
    };
}

// Returns a message object with random data
function createMessage(date) {
    date = date || Date.now();
    var o = emptyMessage();
    o.date = date - 1E8 * (Math.random() * 10 | 0);
    o.body = lipsum();
    o.author = authors[authors.length * Math.random() | 0];
    return o;
}


function loadMessages(date) {
    return Array.apply(null, Array(nMessages)).map(function () {
        return createMessage(date);
    });
}


// Create a few chat messages

var data = {
    messages: loadMessages()
};


var fakeReply = (function () {
    var wait = false;
    return function (callback) {
        if (wait) {
            return;
        }
        wait = true;
        var o = createMessage();
        // Typing speed: 200 chars per second
        var t = 50 * o.body.length | 0;
        setTimeout(function () {
            o.date = Date.now();
            callback(o);
            wait = false;
        }, t);
    };
}());


// Sets scroll event
function onscroll(element, callback) {
    var locked, o = {};

    function tick() {
        callback(o);
        locked = false;
    }

    function onevent() {
        var ev = d3.event;
        if (!locked) {
            if (undefined !== ev.target.scrollTop) { // DOM element
                o.x = ev.target.scrollLeft;
                o.y = ev.target.scrollTop;
            } else { // window or document
                o.x = ev.view.scrollX
                        || ev.view.pageXOffset
                        || document.documentElement.scrollLeft
                        || document.body.scrollLeft;
                o.y = ev.view.scrollY
                        || ev.view.pageYOffset
                        || document.documentElement.scrollTop
                        || document.body.scrollTop;
            }
            d3.timeout(tick);
        }
        locked = true;
    }

    d3.select(element).on('scroll', onevent);
}


function init() {
    var chat = messaging.chat({
        data: data
    });

    chat.update()
        .scrollDown();

    chat.input(function (event) {
        if ('Enter' !== event.key) {
            return;
        }

        var text = tidy(this.innerHTML);
        this.innerHTML = '';

        if (!text.length) {
            return;
        }

        // Make the message object
        var o = emptyMessage();
        o.author = chat.config.me;
        o.date = Date.now();
        o.body = text;

        data.messages.push(o);

        chat.update()
            .scrollDown();

        fakeReply(function (reply) {
            data.messages.push(reply);
            chat.update()
                .scrollDown();
        });
    });

    onscroll(document, function (o) {
        if (!o.y) {
            var mess = chat.config.data.messages[0];
            var date = (mess && mess.date) || Date.now();
            data.messages = data.messages.concat(loadMessages(date));
            chat.update();
        }
    });
}


document.addEventListener("DOMContentLoaded", init);
