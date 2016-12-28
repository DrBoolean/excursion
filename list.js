const daggy = require('daggy')
const Either = require('data.either')
const Task = require('data.task')
const {Left, Right} = Either
const {Fix, ana, apo, cata, zygo, gcata, para, cataM, algProd, algCoProd, Mu, unfix} = require('./index')
const {inspect, id, compose} = require('./utils')

const ListF = daggy.taggedSum({Nil: [], Cons: ['x', 'xs']})
const {Nil, Cons} = ListF

ListF.prototype.inspect = function(f) {
  return this.cata({
    Nil: () => 'Nil',
    Cons: (x, xs) => `Cons(${inspect(x)}, ${inspect(xs)})`
  })
}

ListF.prototype.map = function(f) {
  return this.cata({
    Nil: () => Nil,
    Cons: (x, xs) => Cons(x, f(xs))
  })
}

ListF.prototype.traverse = function(of, f) {
  return this.cata({
    Nil: () => of(Nil),
    Cons: (x, xs) => f(xs).map(ys => Cons(x, ys))
  })
}

const from = xs =>
  xs.reduce((acc, x) => cons(x, acc), nil)

const to = l =>
  l.cata(t =>
    t.cata({
      Nil: () => [],
      Cons: (x, xs) => [x].concat(xs)
    }))

const nil = Fix(Nil)
const cons = (x, xs) => Fix(Cons(x, xs))

////console.log(para(tails, l1))
//const munil = Mu.embed(Nil)
//const mucons = (x, xs) => Mu.embed(Cons(x, xs))
//const arrToList_ = xs =>
//  xs.reduce((acc, x) => mucons(x, acc), munil)

//const mul1 = arrToList_([1,2,3])

//console.log(mul1)
//console.log('sum', mul1.cata(sum))

module.exports = {nil, cons, Nil, Cons, from, to}
