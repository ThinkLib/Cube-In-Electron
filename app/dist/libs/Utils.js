var base = require("util");
base.binarySearch = function(e, s, i) {
    var t = -1,
    n = 0,
    r = e.length - 1;
    for (i || (i = function(e) {
        return e
    }); r >= n;) {
        var o = n + r >> 1;
        i(e[o]) <= s ? (n = o + 1, t = o) : r = o - 1
    }
    return t
},
base.queue = function() {
    this._source = new Array,
    this._front = 0
},
base.queue.prototype = {
    size: function() {
        return this._source.length - this._front
    },
    empty: function() {
        return 0 == this.size()
    },
    push: function(e) {
        this._source.push(e)
    },
    pop: function() {
        if (this.empty()) return void 0;
        var e = this._source[this._front++];
        return this._front << 1 >= this._source.length && (this._source = this._source.slice(this._front), this._front = 0),
        e
    },
    front: function() {
        return this.size() ? this._source[this._front] : void 0
    }
};
var isType = function(e) {
    return function(s) {
        return Object.prototype.toString.call(s) === "[object " + e + "]"
    }
};
base.isNumber = isType("Number"),
base.isObject = isType("Object"),
base.isFunction = isType("Function"),
base.isString = isType("String"),
base.isUndefined = isType("Undefined"),
base.isBoolean = isType("Boolean"),
base.isArray = isType("Array"),
base.isNull = isType("Null"),
base.isUndefinedorNull = function(e) {
    return base.isNull(e) || base.isUndefined(e)
},
module.exports = base;