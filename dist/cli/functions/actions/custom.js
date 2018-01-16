const admin = require('firebase-admin');

/**
 * Creates a custom call
 * @param action
 * @param data
 * @returns {Promise}
 */
function custom(action, data) {
    return new Promise(function (resolve, reject) {

        console.log(action);

        admin.database().ref('_queue/' + action.action.data.name + '/' + action.actionid).set(action).then(() => {
            resolve(true);
        }).catch((error) => {
            reject(error);
        });

    });
}

module.exports = custom;
