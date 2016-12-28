const {tagged} = require('daggy');
const {map, extend, extract} = require('fantasy-land');
const Tuple = tagged('_1', '_2');

const inspect = t =>
  t && t.inspect ? t.inspect() : t

Tuple.prototype.inspect = function() {
    return `Tuple(${inspect(this._1)}, ${inspect(this._2)})`;
};

// Methods
Tuple.prototype.dimap = function(f, g) {
    return Tuple(f(this._1), g(this._2));
};
Tuple.prototype.map = function(f) {
    return Tuple(this._1, f(this._2));
};
Tuple.prototype.curry = function(f) {
    return f(this);
};
Tuple.prototype.uncurry = function(f) {
    return f(this._1, this._2);
};
Tuple.prototype.extend = function(f) {
    return Tuple(this._1, f(this));
};
Tuple.prototype.duplicate = function() {
    return this.extend(x => x)
};
Tuple.prototype.extract = function()  {
    return this._2;
};
Tuple.prototype.foldl = function(f, z) {
    return f(this._2, z);
};
Tuple.prototype.foldr = function(f, z) {
    return f(z, this._2);
};
Tuple.prototype.foldMap = function(f, p) {
    return f(this._2);
};

const tuple2 = Tuple;
const tuple3 = (a, b, c) => Tuple(tuple2(a, b), c);
const tuple4 = (a, b, c, d) => Tuple(tuple3(a, b, c), d);
const tuple5 = (a, b, c, d, e) => Tuple(tuple4(a, b, c, d), e);

const curry2 = (f, a, b) => f(tuple2(a, b));
const curry3 = (f, a, b, c) => f(tuple3(a, b, c));
const curry4 = (f, a, b, c, d) => f(tuple4(a, b, c, d));
const curry5 = (f, a, b, c, d, e) => f(tuple5(a, b, c, d, e));

const uncurry2 = (f, t) => f(t._1, t._2);
const uncurry3 = (f, t) => f(t._1._1, t._1._2, t._2);
const uncurry4 = (f, t) => f(t._1._1._1, t._1._1._2, t._1._2, t._2);
const uncurry5 = (f, t) => f(t._1._1._1._1, t._1._1._1._2, t._1._1._2, t._1._2, t._2);

module.exports = { Tuple, tuple2, tuple3, tuple4, tuple5
                 , curry2, curry3, curry4, curry5
                 , uncurry2, uncurry3, uncurry4, uncurry5
                 };
