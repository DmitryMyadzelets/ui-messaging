
// Alternative for Object.assign
function mergeObject(target) {
    'use strict';
    var i, j, m, n, source, key, keys;
    m = arguments.length;
    for (i = 1; i < m; i += 1) {
        source = arguments[i];
        if (source && typeof source === 'object') {
            keys = Object.keys(source);
            n = keys.length;
            for (j = 0; j < n; j += 1) {
                key = keys[j];
                target[key] = source[key];
            }
        }
    }
    return target;
}

exports.mergeObject = mergeObject;