/*jslint browser: false*/
'use strict';

var messaging = require('./index.js');
var shortId = require('shortid');
var lipsum = require('lorem-ipsum');


var authors = ['Alice', 'Bob', 'Lorem Ipsum'];
var nMessages = 20; // Number of messages


// Returns a message object with random data
function createMessage() {
    return {
        // id is used as a DOM element id
        // so it [can't start with a number](https://www.w3.org/TR/CSS21/syndata.html#value-def-identifier)
        // We add _ to make selectors work
        id: '_' + shortId.generate(),
        date: Date.now() - 1E8 * (Math.random() * 10 | 0),
        body: lipsum(),
        author: authors[authors.length * Math.random() | 0]
    };
}


// Create a few chat messages

var data = {
    messages: Array.apply(null, Array(nMessages)).map(createMessage)
};


function init() {
    var chat = messaging.chat({
        data: data
    });

    chat.update();
    chat.scrollDown();
}

document.addEventListener("DOMContentLoaded", init);
