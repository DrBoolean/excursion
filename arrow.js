// (&&&)
const ampersand = (f, g) => x =>
  [f(x), g(x)]

// (|||)
const bars = (f, g) => e =>
  e.fold(f, g)

// (***)
const stars = (f, g) => ([x, y]) =>
  [f(x), g(y)]

const funzip = ampersand(x => x.map(y => y[0]),
                         x => x.map(y => y[1]))

module.exports = {ampersand, bars, stars, funzip}
