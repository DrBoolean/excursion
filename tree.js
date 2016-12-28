const daggy = require('daggy')
const Tree = daggy.taggedSum({Empty: [], Leaf: ['x'], Node: ['x', 'children']})
const {Node, Leaf, Empty} = Tree
const {Fix} = require('./index')

// This is a forest. Not exactly sure if Tree a [Tree] is a proper fix type though. Works for the most part in my tests.
Tree.prototype.map = function(f) {
  return this.cata({
    Empty: () => Empty,
    Leaf: x => Leaf(x),
    Node: (x, xs) => Node(x, xs.map(f))
  })
}

Tree.prototype.inspect = function(f) {
  return this.cata({
    Empty: () => 'Empty',
    Leaf: x => `Leaf(${inspect(x)})`,
    Node: (x, xs) => `Node(${inspect(x)}, ${xs})`
  })
}

// (a -> b) -> Tree a -> Tree b
const mapTree = f => t =>
  t.cata({
    Empty: () => Fix(Empty),
    Leaf: x => Fix(Leaf(f(x))),
    Node: (x, xs) => Fix(Node(f(x), xs))
  })

// natural transformation
// Tree a -> [a]
const fromTree = t =>
  t.cata({
    Empty: () => [],
    Leaf: x => [x],
    Node: (x, xs) => [x].concat(xs)
  })

module.exports = {Tree, mapTree, fromTree}
