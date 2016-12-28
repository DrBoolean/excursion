const daggy = require('daggy')
const Either = require('data.either')
const {Tuple} = require('./fantasy-tuples')
const Cofree = require('./cofree')
const {id, compose, inspect} = require('./utils')
const {ampersand, bars, stars, funzip} = require('./arrow')

const zip = (f, g) => compose(stars(f, g), funzip)

const comp = (f, g) => compose(f, compose(unfix, g))

//hylo :: Functor f => (f b -> b) -> (a -> f a) -> a -> b
const hylo = (f, g, t) =>
  f(g(t).map(x => hylo(f, g, x)))

// fold :: Recursive t => (Base t a -> a) -> t -> a
const fold = (f, x) => x.cata(f)

// unfold :: Corecursive t => (a -> Base t a) -> a -> t
const unfold = (f, x) => x.ana(f)

//ana g = a where a = embed . fmap a . g
const ana = t => (g, x) =>
  t.embed(g(x).map(y => ana(t)(g, y)))

const cata = (f, x) => x.cata(f)

// apo :: Fixpoint f t => (a -> f (Either a t)) -> a -> t
const apo = t => (coa, x) =>
  t.embed(coa(x).map(y =>
    y.fold(x => apo(t)(coa, x),
           x => x)))

// refold :: Functor f => (f b -> b) -> (a -> f a) -> a -> b
const refold = hylo

// cataM algM = algM <=< (mapM (cataM algM) . unFix)
const cataM = (of, algM) => m =>
  m.project()
  .traverse(of, x => x.cataM(of, algM))
  .chain(algM)

// we use cata here!
// t is an unfixed algebra whos children are done
const para = point => (alg, x) =>
  x.cata(ampersand(alg, t =>
    point(t.map(y => y[1]))))[0]


//type GAlgebra w f a = f (w a) → a
//
// gcata
//   ∷ ∀ f t w a
//   . (Recursive t f, Comonad w)
//   ⇒ DistributiveLaw f w
//   → GAlgebra w f a
//   → t
//   → a
// gcata k g = g <<< extract <<< go
//   where
// go t = k $ map (duplicate <<< map g <<< go) (project t)
//
const gcata = (k, g) => x => {
  const go = t =>
    k(t.project().map(y => go(y).map(g).duplicate()))

  return g(go(x).extract())
}
// go must return a comonad
// t is fix or mu i guess
//
//
// type ElgotAlgebra w f a = w (f a) → a
//
// elgotCata
//   ∷ ∀ f t w a
//   . (Recursive t f, Comonad w)
//   ⇒ DistributiveLaw f w
//   → ElgotAlgebra w f a
//   → t
//   → a
// elgotCata k g = g <<< go
//   where
// go t = k $ map (map g <<< duplicate <<< go) (project t)
const elgotCata = (k, g) => x => {
  const go = t =>
    k(t.project().map(y => go(y).duplicate().map(g)))

  return g(go(x))
}

// CATA VIA Elgot

//const distCata = m =>
//  Id.of(m.map(x => x.extract())) // same

////our alg expects w (f a)
//const ecata = (alg, t) =>
//  elgotCata(distCata, x => alg(x.extract()))(t)



// CATA VIA GCATA

// const distCata = m =>
//   Id.of(m.map(x => x.extract())) // this extract traverses the Id

// our alg expects Cons(x, Id(acc)), but we extract in advance here
// const cata = (alg, t) =>
//   gcata(distCata, x => alg(x.map(y => y.extract())))(t)

//type DistributiveLaw f w = ∀ a. f (w a) → w (f a)
//distZygo ∷ ∀ f a. Functor f ⇒ Algebra f a → DistributiveLaw f (Tuple a)
//distZygo g m = Tuple (g (map fst m)) (map snd m)
const distZygo = alg => m =>
  Tuple(alg(m.map(x => x._1)), m.map(x => x._2))
// NOTE: since it returns a Tuple of the acc and Nil, the children will too!

// we distribute the f (w a) -> w (f a)
// alg is the aux fn
// m is our actual pattern functor holding a tuple:
  //
  // m.map on Nil does nothing so our alg gets passed Nil, then it is
  // wrapped up in a Tuple(acc, Nil) via distZygo itself.
  // So this is the result of go() in gcata, which is a Comonad.
  // Now. we're finished our "to the bottom' recursion in the middle of
  // go() and we must map the zalg (pass in _.2 from on our Tuple) to
  // transform the children in _2 from Cons/Nil to acc2
  // Then we duplicate it because we want _2 to hold the whole
  // tuple since it is what goes into zalg at the end of the day.
  // Finally, on our last iteration, we end up with our children finished
  // and we want to pass our entire pattern functor we extract() the _2 and call zalg again

const zygo = (alg, zalg, x) =>
  gcata(distZygo(alg), zalg)(x)

// > algZygo :: Functor f =>
// >     (f  b     -> b) ->
// >     (f (a, b) -> a) ->
// >     f (a, b) -> (a, b)
// > algZygo f g = g &&& f . fmap snd
//const algZygo = (f, g) => ampersand(g, compose(f, x => x.map(snd)))
// > zygo :: Functor f =>
// >         (f b -> b) -> (f (a, b) -> a) -> Fix f -> a
// > zygo f g = fst . cata (algZygo f g)
// const zygo = (f, g, x) =>
//   fst(cata(algZygo(f, g), x))
// para but passes it to an f
// mutu but doesn't pass [acc1, acc2] to both

const unfix = x => x.project()

// distGHisto
//   ∷ ∀ f h
//     . (Functor f, Functor h)
//     ⇒ DistributiveLaw f h
//     → DistributiveLaw f (Cofree h)
//   distGHisto k x = unfoldCofree x (map extract) (k <<< map tail)
const distGHisto = (k, x) =>
  Cofree.unfold(x,
                y => y.map(_y => _y.extract()),
                r => k(r.map(x => x.tail)))

const distHisto = x => distGHisto(id, x)

const histo = (alg, x) => gcata(distHisto, alg)(x)

//newtype Fix f = Fix (f (Fix f))
const Fix = f => ({
  f,
  project: () => f,
  embed: Fix,
  inspect: () =>
    `Fix(${inspect(f)})`,
  cata: g =>
    g(f.map(x => x.cata(g))),
  para: alg => para(Fix)(alg, Fix(f)),
  zygo: (aux, alg) => zygo(aux, alg, Fix(f)),
  histo: alg => histo(alg, Fix(f)),
  cataM: (of, alg) => cataM(of, alg)(Fix(f))
})

Fix.embed = Fix
Fix.ana = ana(Fix)
Fix.apo = apo(Fix)
Fix.to = t => Fix.ana(id, t)
Fix.from = t => t.cata(id)

// f is a pattern functor. Embed church encodes the fold inside the Mu
//newtype Mu f = Mu (forall a. (f a -> a) -> a)
const Mu = f =>
({
  project: () => Mu(f).cata(y => y.map(Mu.embed)),
  cata: g => f(g),
  para: alg => para(Mu)(alg, Mu(f)),
  zygo: (aux, alg) => zygo(aux, alg, Mu(f)),
  cataM: (of, alg) => cataM(of, alg)(Mu(f))
})

// cata calls f (the fn in Mu), so this is recursive.
Mu.embed = m =>
  Mu(f => f(m.map(x => x.cata(f))))

Mu.ana = ana(Mu)



module.exports = {
  Fix,
  Mu,
  ana,
  cata,
  gcata,
  para,
  cataM,
  zip,
  comp,
  zygo,
  histo,
  elgotCata,
  apo,
  unfix
}

