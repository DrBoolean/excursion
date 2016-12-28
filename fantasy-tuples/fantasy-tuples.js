const nested = require('./src/nested');
const tuples = require('./src/tuples');

module.exports = { nested
                 , Tuple: nested.Tuple
                 , tuples
                 , Tuple2: tuples.Tuple2
                 , Tuple3: tuples.Tuple3 
                 , Tuple4: tuples.Tuple4 
                 , Tuple5: tuples.Tuple5
                 };
