const inspect = t =>
  t && t.inspect ? t.inspect() : t

const id = x => x
const compose = (f, g) => x => f(g(x))

module.exports = {id, compose, inspect}
