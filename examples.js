const Task = require('data.task')
const Either = require('data.either')
const {Left, Right} = Either
const {Fix, Mu, comp, zip } = require('./index')
const {inspect, id} = require('./utils')
const List = require('./list')
const {cons, nil, Cons, Nil} = List // cons, nil are wrapped in Fix
const Nat = require('./nat')

// Arbitrary Examples. Mostly on List, but works on any Fixed Point structure
// ==================

// Some usual definitions first...
const mapList = f => t =>
  t.cata({
    Nil: () => nil,
    Cons: (x, xs) => cons(f(x), xs)
  })

const filterList = f => t =>
  t.cata({
    Nil: () => nil,
    Cons: (x, xs) => f(x) ? cons(x, xs) : xs
  })

const list = List.from([1, 2, 3])


// Basic usage
// ==================================
const sum = t =>
  t.cata({
    Nil: () => 0,
    Cons: (x, acc) => x + acc // <-- acc is the already finished children
  })

console.log('Basic')
const result = list.cata(sum)
console.log(result)
// 6



// Composition - one after the next in 1 pass
// ==================================
console.log('\n\nCOMP')
const result1 = list.cata(comp(filterList(x => x > 1), mapList(x => x + 1)))
console.log(List.to(result1))
// [ 4, 3, 2 ]



// Zip - Two separate loops in 1 pass
// ==================================
console.log('\n\nZIP')
const result2 = list.cata(zip(filterList(x => x > 1), mapList(x => x + 1)))
console.log(result2)
// [ Fix(Cons(3, Fix(Cons(2, Fix(Nil))))),
//   Fix(Cons(4, Fix(Cons(3, Fix(Cons(2, Fix(Nil))))))) ]

// let's turn those into arrays...
console.log(result2.map(List.to))
// [ [ 3, 2 ], [ 4, 3, 2 ] ]



// Monadic - Here we're doing async
// ==================================
const delaySum = t =>
  t.cata({
    Nil: () => Task.of(0),
    Cons: (x, xs) => Task.of(x + xs)
  })

console.log('\n\nMonadic')
list.cataM(Task.of, delaySum).fork(console.error, console.log)
// 6



// Para - Get the tail passed in
// ==================================
const factorial = t =>
  t.cata({
    Zero: () => 1,
    Succ: ([acc, tail]) => acc * (Nat.to(tail) + 1) // tail is the prev nat number
  })

console.log('\n\nPara')
const ten = Nat.from(10)
const result3 = ten.para(factorial)
console.log(result3)
// 3628800


// Zygo - Get a second accumulator passed in via a helper fn
// ==================================
const toNum = t =>
  t.cata({
    Zero: () => 0,
    Succ: x => x + 1
  })

const factorial_ = t =>
  t.cata({
    Zero: () => 1,
    Succ: ({_1: tail, _2: acc}) => acc * (tail + 1) // tail is now an int
  })

console.log('\n\nZygo')
const result4 = ten.zygo(toNum, factorial_)
console.log(result4)
// 3628800

// Ana - unfold to build up a structure
// ==================================

const range = n =>
  Fix.ana(x => x === 0 ? Nil : Cons(x, x-1), n)

console.log('\n\nAna')
const result5 = range(10)
console.log(List.to(result5))
// [ 10, 9, 8, 7, 6, 5, 4, 3, 2, 1 ]

// Histo - receive the history (previous acc and tail) in an annotation
// ==================================
const fib = t =>
  t.cata({
    Zero: () => 0,
    Succ: ({head, tail}) =>
      tail.cata({
        Zero: () => 1,
        Succ: ({head: head2}) => head + head2
      })
  })


console.log('\n\nHisto')
const result6 = ten.histo(fib)
console.log(result6)
// 55
