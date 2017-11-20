const actions = {
  webhook: require('./actions/webhook'),
  email: require('./actions/email'),
  googleSheets: require('./actions/googleSheets')
}
module.exports = actions;
