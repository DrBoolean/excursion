const daggy = require('daggy')
const {id, inspect} = require('./utils')

// data Cofree f a = Cofree a (f (Cofree f a))
const Cofree = daggy.tagged('head', 'tail')
Cofree.prototype.map = function(f) {
  return Cofree(f(this.head), this.tail.map(x => x.map(f)))
}
Cofree.prototype.extend = function(f) {
  return Cofree(f(this), this.tail.map(t => t.extend(f)))
}
Cofree.prototype.duplicate = function() {
  return this.extend(id)
}
Cofree.prototype.extract = function() {
  return this.head
}
Cofree.prototype.inspect = function() {
  return `Cofree(${inspect(this.head)}, ${inspect(this.tail)})`

}
// s -> (s -> a) -> (s -> f s) -> Cofree f a
//  Cofree (e s) (defer \_ -> map (\s1 -> unfoldCofree s1 e n) (n s))
Cofree.unfold = function(s, e, n) {
  return Cofree(e(s), n(s).map(s1 => Cofree.unfold(s1, e, n)))
}

module.exports = Cofree
