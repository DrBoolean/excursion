# Fantasy Tuples

![](https://raw.github.com/puffnfresh/fantasy-land/master/logo.png)

## General

Tuples are another way of storing multiple values in a single value.
They have a fixed number of elements (immutable), and so you can't
cons to a tuple.
Elements of a tuple do not need to be all of the same type!

Example usage:

```javascript
var tuples = require('fantasy-tuples'),
    Tuple2 = tuples.Tuple2;

Tuple2(1, 2)._1; // 1   
```

## Testing

### Library

Fantasy Options uses [nodeunit](https://github.com/caolan/nodeunit) for 
all the tests and because of this there is currently an existing 
[adapter](test/lib/test.js) in the library to help with integration 
between nodeunit and Fantasy Check.

### Coverage

Currently Fantasy Check is using [Istanbul](https://github.com/gotwarlost/istanbul) 
for code coverage analysis; you can run the coverage via the following
command:

_This assumes that you have istanbul installed correctly._

```
istanbul cover nodeunit -- test/*.js
```
