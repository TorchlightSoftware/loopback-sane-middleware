// This is a workaround for supporting arg injection middleware
//
// https://github.com/strongloop/loopback/pull/3023
// https://github.com/strongloop/loopback/pull/3048
//
// This is a custom middleware pipeline to give you control over order of operations.

const _ = require('lodash')

// apply an array of middlewares
// is it a performance concern to perform these calls recursively?
function applyAll(middlewares, ctx, next) {
  [first, ...rest] = middlewares
  if (typeof first !== 'function') return next()

  // call the first middleware
  first(ctx, (err) =>
    // keep going unless we get an error
    err ? next(err) : applyAll(rest, ctx, next)
  )
}

module.exports = function applyMiddleware(app, getMiddleware, policy) {
  const middleware = getMiddleware(app)

  const matchOrStar = ([p, s]) => p === '*' || p === s
  const match = (pattern, string) => {
    if (!~string.indexOf('.')) return false
    const matchup = _.zip(
      pattern.split('.'),
      string.split('.')
    )
    return _.every(matchup, matchOrStar)
  }

  // use the policy rules to apply the middleware to the app
  const rules = _.get(policy, 'rules', [])
  _.each(rules, (r) => {

    // check to see if it's a valid definition
    if ((r.on == null && r.except == null) || r.apply == null)
      return console.warn('Invalid middleware definition.  Requires "apply", and either "on" or "except":', r)

    // make these properties into arrays so we can iterate over them
    const box = (val) => val ? Array.isArray(val) ? val : [val] : []

    const except = box(r.except)
    const on = box(r.on)
    const apply = box(r.apply)
      .map(a => {
        const mw = middleware[a]
        if (!mw) console.warn('No middleware found by that name.  Ignoring: ', a)
        return mw
      })
      .filter(a => a != null)

    // We always use the *.* pattern so that we can control the ordering.
    // Then we do our own filtering internally.
    // Loopback has logic that changes the ordering of the middleware based on the specificity of
    // your pattern, which is quite frustrating to work with, and is what we are trying to avoid.
    //
    // This is probably an inefficient implementation.  If anyone knows how to add items directly into
    // the loopback middleware queue that would be helpful.
    app.remotes().before('*.*', (ctx, next) => {

      // check 'except' rules
      for (let e of except) {
        if (match(e, ctx.methodString)) {
          return next()
        }
      }

      // check 'on' rules
      if (on.length > 0) {
        let found = false
        for (let o of on) {
          if (match(o, ctx.methodString)) {
            found = true
            break
          }
        }

        if (found === false) return next()
      }

      // apply (maybe multiple) middleware steps
      return applyAll(apply, ctx, next)
    })

  })
}
