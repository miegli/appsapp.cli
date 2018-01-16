const actions = {
  webhook: require('./actions/webhook'),
  email: require('./actions/email'),
  googleSheets: require('./actions/googleSheets'),
  custom: require('./actions/custom')
}
module.exports = actions;
