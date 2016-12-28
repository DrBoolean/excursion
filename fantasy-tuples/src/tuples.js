const daggy = require('daggy');
const {Tuple} = require('./nested');
const {concat} = require('fantasy-land');

const Tuple2 = Tuple;
const Tuple3 = daggy.tagged('_1', '_2', '_3');
const Tuple4 = daggy.tagged('_1', '_2', '_3', '_4');
const Tuple5 = daggy.tagged('_1', '_2', '_3', '_4', '_5');

// Methods
Tuple2.prototype[concat] = function(b) {
    return Tuple2(
        this._1[concat](b._1),
        this._2[concat](b._2)
    );
};
Tuple3.prototype[concat] = function(b) {
    return Tuple3(
        this._1[concat](b._1),
        this._2[concat](b._2),
        this._3[concat](b._3)
    );
};
Tuple4.prototype[concat] = function(b) {
    return Tuple4(
        this._1[concat](b._1),
        this._2[concat](b._2),
        this._3[concat](b._3),
        this._4[concat](b._4)
    );
};
Tuple5.prototype[concat] = function(b) {
    return Tuple5(
        this._1[concat](b._1),
        this._2[concat](b._2),
        this._3[concat](b._3),
        this._4[concat](b._4),
        this._5[concat](b._5)
    );
};

module.exports = {Tuple, Tuple2, Tuple3, Tuple4, Tuple5};