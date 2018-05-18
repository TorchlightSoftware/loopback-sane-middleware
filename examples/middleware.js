module.exports = (app) => ({
  const {User} = app.models

  authenticate: (ctx, next) => {
    next()
  },
  attachSession: (ctx, next) => {
    next()
  },
  verifyOwner: (ctx, next) => {
    next()
  },
  logRequest: (ctx, next) => {
    next()
  },
})
