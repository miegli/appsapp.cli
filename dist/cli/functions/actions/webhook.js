var Unirest = require('unirest');

/**
 * Creates a webhook call
 * @param action
 * @param data
 * @returns {Promise}
 */
function webhook(action, data) {
    return new Promise(function (resolve, reject) {

        Unirest[action.action.data.method](action.action.data.url).type(action.action.data.type).end(function (response) {
            if (response.statusType < 3) {
                resolve({response: {state: 'done', data: response.body}});
            } else {
                reject({response: {state: 'error', data: response.status}})
            }

        });

    });
}

module.exports = webhook;
