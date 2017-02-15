/*jslint browser: false*/
'use strict';

var shortId = require('shortid');
var lipsum = require('lorem-ipsum');
var d3 = Object.assign(require('d3-selection'), require('d3-timer'));

var messaging = require('./messages.js');
var input = require('./input').input;
var tidy = require('./tidy-input');
var scroller = require('./scroller');


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
    var array = [], i;
    for (i = 0; i < nMessages; i += 1) {
        array.push(createMessage(date));
    }
    return array;
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
    var locked, o;

    function tick() {
        callback(o);
        locked = false;
    }

    d3.select(element).on('scroll', function () {
        // var ev = d3.event;
        if (!locked) {
            o = scroller.of(element).get();
            d3.timeout(tick);
        }
        locked = true;
    });
}


function init() {
    var chat = messaging.chat({
        data: data
    });

    var scrollme = scroller.bind(document);


    // Scrolls the element down
    function down() {
        var o = scrollme.get();
        scrollme.top(o.h);
    }

    chat.update();
    down();

    chat.input = input(null, function (event) {
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

        chat.update();
        down();

        fakeReply(function (reply) {
            data.messages.push(reply);
            chat.update();
            down();
        });
    });


    onscroll(document, function (o) {
        if (o.y === 0) {

            // Get the day of an oldest message
            var mess = chat.config.data.messages[0];
            var date = (mess && mess.date) || Date.now();

            // Calculate previous day, in milliseconds
            var d = new Date(date);
            d.setDate(d.getDate() - 1);
            date = d.getTime();

            // Join old and new messages
            data.messages = data.messages.concat(loadMessages(date));
            chat.update();

            // Keep the current position of the messages' container
            var top = scrollme.get().h - o.h;
            if (top > 0) {
                scrollme.top(top);
            }
        }
    });
}


document.addEventListener("DOMContentLoaded", init);
