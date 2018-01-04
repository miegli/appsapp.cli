/**
 * Creates a webhook call
 * @param action
 * @param data
 * @returns {Promise}
 */
function webhook(action, data) {
  return new Promise(function (resolve, reject) {

    console.log(data);
    console.log(action);

    resolve({response: {state: 'done'}});
  });
}

module.exports = webhook;