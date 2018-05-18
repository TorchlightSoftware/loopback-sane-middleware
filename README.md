# Loopback Sane Middleware

This is a middleware plugin for loopback that gives you control of ordering.  These rules will be applied in the order that you define them.

## Setup

Add this to `server/boot/sane-middleware.js`:

```js
const applyMiddleware = require('loopback-sane-middleware')

// These are the middleware functions you want to apply.
// We typically put these in a separate file, but have included them inline here.
const middleware = (app) => {

  // you can get your models from the app instance
  const {models} = app

  return {
    // middleware accepts a loopback context
    // some interesting properties are:
    //   ctx.req.accessToken
    //   ctx.args.options
    // middleware must call next() or it will time out
    lookupAccountId(ctx, next) {
    },
  }
}

// These are the rules for applying your middleware.
// Again, we typically put these in their own file.
const policy = {
  rules: [
    {
      apply: 'lookupAccountId'
      on: '*.*',
    },
  ]
}

module.exports = function(server) {
  applyMiddleware(server, middleware, policy)
}
```

The `on` and `apply` parameters both support arrays, so you can apply middleware conveniently to large portions of the app.

## Intercepting HTTP Options

If you want to have HTTP headers, query string, or body data available to your middleware, your remote method must accept the options arg like so:

```js
User.remoteMethod('get', {
  accepts: [
    {arg: 'options', type: 'object', http: 'optionsFromRequest'},
  ],
})
```

This will populate the `ctx` property.
