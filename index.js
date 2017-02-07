/*jslint browser: false*/
/*global d3*/
'use strict';

var config = {
    locale: 'ru',
    me: 'Bob',
    l10n: {
        today: {
            undefined: 'Today',
            it: 'Oggi',
            ru: 'Сегодня'
        },
        placeholder: {
            undefined: 'Enter your message here',
            it: 'Scriva il suo messagio qui...',
            ru: 'Напишите сообщение...'
        }
    }
};

// Helpers

// Returns localized string
function l10n(key) {
    return config.l10n[key][config.locale] || config.l10n[key][undefined];
}



// Returns formatted day string from unixTime
function getDayString(d) {
    d = +d.key;
    var date = new Date(d);
    var today = new Date().setHours(0, 0, 0, 0);
    var day = date.toLocaleDateString(config.locale, {
        //weekday: 'short',
        //year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    if (d === today) {
        return l10n('today');
    }
    return day;
}

// Data used for rendering messages
var data = {
    messages: [],
    days: []
};


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


function update() {
    // Sort messages
    data.messages = data.messages.sort(function (a, b) {
        return b.date < a.date;
    });

    data.days = nestMessages(data.messages);

    var root = d3.select('#messages');

    // Day

    // Day join
    var day = root.selectAll('.messages_day_group')
        .data(data.days, function (d) {
            return d.key;
        });

    day.exit().remove();

    var enter = day.enter()
        .append('div').attr('class', 'messages_day_group');

    enter.append('div').attr('class', 'messages_day');

    // Merge update and enter selections
    day = enter.merge(day);

    // Update day (make sense when the current day changes)
    day.selectAll('.messages_day')
        .text(getDayString);

    // Author

    var author = day.selectAll('.messages_author_group')
        .data(function (d) {
            return d.values;
        });
    // no need for key?

    author.exit().remove();

    enter = author.enter()
        .append('div').attr('class', 'messages_author_group')
        .classed('messages_are_mine', function (d) {
            return d.key === config.me;
        });

    author = enter.merge(author);

    // Message

    var message = author
        .selectAll('.message')
        .data(function (d) {
            return d.values;
        }, function (d) {
            return d.uid;
        });

    message.exit().remove();

    enter = message.enter();

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

    /**/
}

update();

// Make shure the user can see the last message
d3.select('#messages').each(function () {
    // [selector].scrollIntoView();
    this.scrollTop = this.scrollHeight;
});
