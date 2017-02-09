/*jslint browser: false*/
'use strict';

var messaging = require('./index.js');
var shortId = require('shortid');
var lipsum = require('lorem-ipsum');
var tidy = require('./tidy-input');


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
function createMessage() {
    var o = emptyMessage();
    o.date = Date.now() - 1E8 * (Math.random() * 10 | 0);
    o.body = lipsum();
    o.author = authors[authors.length * Math.random() | 0];
    return o;
}


// Create a few chat messages

var data = {
    messages: Array.apply(null, Array(nMessages)).map(createMessage)
};


function init() {
    var chat = messaging.chat({
        data: data
    });

    chat.update()
        .scrollDown();

    chat.input(function (event) {
        if ('Enter' === event.key && event.ctrlKey) {
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
        }
    });
}


document.addEventListener("DOMContentLoaded", init);
