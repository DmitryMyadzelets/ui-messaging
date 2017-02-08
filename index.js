/*jslint browser: false*/
/*global d3*/
'use strict';

// Get d3 selection module only
// See (how to use d3 modules)[https://github.com/d3/d3/blob/master/README.md]
var d3 = Object.assign({}, require('d3-selection'));


var defaultConfig = {
    me: 'Bob', // User's id

    // Localization
    l10n: {
        today: {
            undefined: 'Today',
            it: 'Oggi',
            ru: 'Сегодня'
        },
        placeholder: {
            undefined: 'Enter your message here...',
            it: 'Scriva il suo messagio qui...',
            ru: 'Напишите сообщение...'
        }
    },

    // DOM ids
    ids: {
        messages: '#messages'
    },

    classes: {
        day: 'messages_day_group',
        day_header: 'messages_day',
        author: 'messages_author_group',
        my_messages: 'messages_are_mine'
    },

    // Data used for rendering messages
    data: {
        messages: [],
        days: []
    }
};

// Helpers

// Given an array of messages,
// returns an array of 2-level nested messages.
// Nests messages considering their day and author.
var nestMessages = (function () {
    // Nests a message into array considering its author
    function nestAuthor(message, array) {
        var obj = array[array.length - 1] || {};
        if (message.author !== obj.key) {
            obj = {
                key: message.author,
                values: []
            };
            array.push(obj);
        }
        obj.values.push(message);
    }

    // Nests a message into array considering its day
    function nestDay(message, array) {
        var obj = array[array.length - 1] || {};
        var day = new Date(message.date).setHours(0, 0, 0, 0);
        if (day !== obj.key) {
            obj = {
                key: day,
                values: []
            };
            array.push(obj);
        }
        nestAuthor(message, obj.values);
    }

    return function (messages) {
        var array = [], i, l = messages.length;
        for (i = 0; i < l; i += 1) {
            nestDay(messages[i], array);
        }
        return array;
    };
}());


// Returns string representing a day, given unixTime
function getDayString(d) {
    d = +d.key;
    var date = new Date(d);
    var today = new Date().setHours(0, 0, 0, 0);
    var day = date.toLocaleDateString(this.config.locale, {
        //weekday: 'short',
        //year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    if (d === today) {
        return this.l10n('today');
    }
    return day;
}


function Messenger(config) {
    // Make own config s.t. the defaults remain intact for other instances
    this.config = Object.create(defaultConfig);

    this.getDayString = getDayString.bind(this);

    Object.assign(this.config, config);
}


// Helpers

// Returns localized string from config
Messenger.prototype.l10n = function (key) {
    return this.config.l10n[key][this.config.locale] || this.config.l10n[key][undefined];
};



function sortComparator(a, b) {
    return b.date < a.date;
}


Messenger.prototype.update = function () {

    var config = this.config; // short-cut

    // Data preparation

    var data = {};
    data.messages = config.data.messages.sort(sortComparator);
    data.days = nestMessages(data.messages);

    var root = d3.select(config.ids.messages);

    if (!root.size()) {
        console.warn('Can\'t find the DOM element: ', config.ids.messages);
    }

    // DOM tree

    //      div.messages
    // 1        div.messages_day_group
    //              div.messages_day
    // 2            div.messages_author_group .messages_are_mine
    // 3                div.message .message_is_my .same_author .same_time
    //                      div.message_time
    //                      div.message_left_part
    //                          div.message_author
    //                          div.message_body

    var days = this.updateDays(root, data.days);
    var author = this.updateAuthors(days);
    this.updateMessages(author);

    // Make sure the user can see the last message
    d3.select('html').each(function () {
        // [selector].scrollIntoView();
        console.log([this.scrollTop, this.scrollHeight]);
        this.scrollTop = this.scrollHeight;
    });

};


Messenger.prototype.updateDays = function (parent, data) {
    var classes = this.config.classes; // short-cut

    var sel = parent.selectAll('.' + classes.day)
        .data(data, function (d) {
            return d.key;
        });

    sel.exit().remove();

    var enter = sel.enter()
        .append('div').attr('class', classes.day);

    enter.append('div').attr('class', classes.day_header);

    // Merge update and enter selections
    sel = enter.merge(sel);

    // Update the group header (make sense when the current day changes)
    sel.selectAll('.' + classes.day_header).text(this.getDayString);

    return sel;
};


Messenger.prototype.updateAuthors = function (parent) {
    var self = this;
    var classes = this.config.classes; // short-cut

    var sel = parent.selectAll('.' + classes.author)
        .data(function (d) {
            return d.values;
        });
    // no need for key?

    sel.exit().remove();

    var enter = sel.enter()
        .append('div').attr('class', classes.author)
        .classed(classes.my_messages, function (d) {
            return d.key === self.config.me;
        });

    sel = enter.merge(sel);

    return sel;
};


Messenger.prototype.updateMessages = function (parent) {
    var config = this.config;

    var message = parent
        .selectAll('.message')
        .data(function (d) {
            return d.values;
        }, function (d) {
            return d.id;
        });

    message.exit().remove();

    var enter = message.enter();

    var msg = enter.append('div').attr('class', 'message')
        .attr('id', function (d) {
            return d.uid;
        })
        .classed('message_is_my', function (d) {
            return d.author === config.me;
        })
        .classed('same_author', function (d, i) {
            var pd = d3.select(this.parentNode).datum();
            return i > 0 && pd.values[i - 1].author === d.author;
        })
        .classed('same_time', function (d, i) {
            if (i > 0) {
                var pd = d3.select(this.parentNode).datum();
                // same author
                var sa = pd.values[i - 1].author === d.author;
                var pdate = pd.values[i - 1].date;
                var delta = d.date - pdate;
                return sa && delta < 1000 * 60; // 1 min
            }
        });

    msg.append('div').attr('class', 'message_time')
        .text(function (d) {
            var date = new Date(+d.date);
            var time = date.toLocaleTimeString(config.locale, {
                hour: 'numeric',
                minute: 'numeric'
            });
            return time;
        });

    var left = msg.append('div').attr('class', 'message_left_part');

    left.append('div')
        .classed('message_author', true)
        .text(function (d) {
            return d.author;
        });

    left.append('div')
        .classed('message_body', true)
        .html(function (d) {
            return d.body;
        });
};


function chat(config) {
    return new Messenger(config);
}


exports.chat = chat;
