const daggy = require('daggy')
const {Fix, ana} = require('./index')
const {inspect} = require('./utils')

const Nat = daggy.taggedSum({Succ: ['x'], Zero: []})
const {Succ, Zero} = Nat
Nat.prototype.inspect = function() {
  return this.cata({
    Zero: () => 'Zero',
    Succ: x => `Succ(${inspect(x)})`
  })

}
Nat.prototype.map = function(f) {
  return this.cata({
    Zero: () => Zero,
    Succ: x => Succ(f(x))
  })
}

const from = n =>
  ana(Fix)(y => y < 1 ? Zero : Succ(y-1), n)

const to = nat =>
  nat.cata(t =>
    t.cata({
      Zero: () => 0,
      Succ: x => x + 1
    }))

// Seems like we're missing an implicit coercion from the type family

//console.log(para(fact, ten))

//console.log(cata(toNum, ten))
//
//> fib :: Integer -> Integer
//> fib = histo f where
//>   f :: NatF (Ann NatF Integer) -> Integer
//>   f Zero                                        = 0
//>   f (Succ (unAnn -> (Zero,_)))                  = 1
//>   f (Succ (unAnn -> (Succ (unAnn -> (_,n)),m))) = m + n

//Succ holds an annotation which looks like:
// Cofree(2, Succ(Cofree(1, Succ(Cofree(1, Succ(Cofree(0, Zero)))))))
// That is, head is 2, tail is the rest. It's like para, but with the result too
const fib = t =>
  t.cata({
    Zero: () => 0,
    Succ: ann =>
      ann.tail.cata({
        Zero: () => 1,
        Succ: an => an.head + ann.head
      })
  })

// const ten = ana(Fix)(y => y < 1 ? Zero : Succ(y-1), 10)
// console.log(histo(fib, ten))

module.exports = {Nat, from, to}
