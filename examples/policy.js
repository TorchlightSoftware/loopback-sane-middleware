module.exports = {
  rules: [
    {
      apply: 'logRequest'
      to: '*.*',
    },
    {
      apply: ['authenticate', 'lookupAccountId', 'attachSession']
      except: ['User.login', 'User.signup'],
    },
  ]
}
