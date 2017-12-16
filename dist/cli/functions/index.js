/**
 * Copyright (c) 2017 by Michael Egli
 *
 *
 *
 * firebase database structure
 *
 * - session
 * --- {userid}
 * ----- {project}
 * ------ {object} business objects
 * ------- {objectid} business object identifier / single record
 * --------- data (mixed)
 * --------- action
 * ----------- {actionid}
 * ------------- name (string)
 * ------------- state (string)

 *
 */

'use strict';

/**
 * load core modules
 */
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
const uuidV1 = require('uuid/v1');
const request = require('request-promise');
const base64 = require('base-64');

/**
 * load action modules
 */
const actions = require('./actions');

/**
 * set decrypt hashes
 * @type {{}}
 */
let decryptHashes = {};

admin.database().ref("_sha1").on('value', (snapshot) => {
    decryptHashes = snapshot.val();
});


/**
 * constructor loader
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({__proto__: []} instanceof Array && function (d, b) {
            d.__proto__ = b;
        }) ||
        function (d, b) {
            for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        };
    return function (d, b) {
        extendStatics(d, b);

        function __() {
            this.constructor = d;
        }

        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length,
        r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


/**
 * Connect realtime database for watching user session updates
 */
exports.connectRealtimeDatabase = functions.database.ref('session/{user}/{project}/{object}/{objectid}/action/{actionid}').onCreate(event => {
    const date = new Date();
    const original = event.data.val();
    const identifier = uuidV1();

    if (original.state !== 'requested') {
        return null;
    }

    const actiondata = {
        'date': date.getTime(),
        'project': event.params.project,
        'object': event.params.object,
        'objectid': event.params.objectid,
        'user': event.params.user,
        'action': original,
        'actionid': event.params.actionid,
        'source': 'database',
        'snapshot': null,
        'target': 'session/' + event.params.user + '/' + event.params.project + '/' + event.params.object + '/' + event.params.objectid
    };

    /**
     * create an entry to event queue for later execution of given action/task.
     */
    return new Promise(function (resolve, reject) {

        admin.database().ref(actiondata.target + "/data").once('value', (snapshot) => {
            actiondata.snapshot = snapshot.val();
            let actiondataFinal = actiondata;
            actiondataFinal.additionActions
            admin.database().ref('_events/' + identifier).set(actiondataFinal).then();

            if (actiondata.action.additionActions && typeof actiondata.action.additionActions == 'object') {
                actiondata.action.additionActions.forEach((additionalAction) => {
                    actiondata.action = additionalAction;
                    actiondata.target = null;
                    admin.database().ref('_events/' + uuidV1()).set(actiondata).then();
                });
            }

            resolve(true);

        }).catch(() => {
            admin.database().ref('_events/' + identifier).set(actiondata).then();
            if (actiondata.action.additionActions && typeof actiondata.action.additionActions == 'object') {
                actiondata.action.additionActions.forEach((additionalAction) => {
                    actiondata.action = additionalAction;
                    actiondata.target = null;
                    admin.database().ref('_events/' + uuidV1()).set(actiondata).then();
                });
            }

            resolve(true);

        });

    });

});

/**
 * Connects firestore
 *
 */
exports.connectCloudFirestore = functions.firestore.document('session/{user}/{project}/{object}/{objectid}/action/{actionid}/{action}').onCreate(event => {

    const date = new Date();


    const actiondata = {
        'date': date.getTime(),
        'project': event.params.project,
        'object': event.params.object,
        'objectid': event.params.objectid,
        'user': event.params.user,
        'action': event.params.action,
        'actionid': event.params.actionid,
        'source': 'firestore'
    }

    return admin.database().ref('_events/' + uuidV1()).set(actiondata).then(function () {
        // call
        return true;
    }).catch(function (error) {
        return error;
    });


});


/**
 * Observes realtime database for persistable models constructor update
 */
exports.watchConfigConstructorUpdates = functions.database.ref('_config/{object}/constructor').onUpdate(event => {

    return new Promise(function (resolve, reject) {

        admin.database().ref('_config/' + event.params.object).once('value', (snapshot) => {

            let actions = snapshot.val();

            Object.keys(actions).forEach((action) => {

                if (action !== 'constructor') {
                    call({
                        'object': event.params.object,
                        'action': {name: action}
                    }, null).then(() => {
                        // silent done
                    }).catch((err) => {
                        console.log(err);
                    });
                }

            });

            resolve(true);

        });

    });


});

/**
 * Connect realtime database for watching and execute events / actions
 */
exports.connectEvents = functions.database.ref('_events/{actionid}').onCreate(event => {

    const original = event.data.val();
    const identifier = event.params.actionid;

    const actiondata = {
        'date': original.date,
        'project': original.project,
        'object': original.object,
        'objectid': original.objectid,
        'user': original.user,
        'action': original.action,
        'actionid': original.actionid,
        'source': original.source,
        'snapshot': null,
        'target': original.target ? original.target : null
    };

    /**
     * Call action by given event queue object
     */
    return new Promise(function (resolve, reject) {

        call(actiondata, original.snapshot !== undefined ? original.snapshot : null).then((data) => {

            admin.database().ref('_events/' + identifier).remove().then(function () {
                if (actiondata.target !== undefined && actiondata.target) {
                    admin.database().ref(actiondata.target + "/action/" + actiondata.actionid).set(data).then(function () {
                        admin.database().ref(actiondata.target + "/action/" + actiondata.actionid).remove().then();
                        resolve(data);
                    });
                } else {
                    resolve(data);
                }
            });
            resolve(data);
        }).catch((error) => {

            admin.database().ref('_events/' + identifier).remove().then(function () {
                if (actiondata.target !== undefined && actiondata.target) {
                    admin.database().ref(actiondata.target + "/action/" + actiondata.actionid).set({
                        state: 'error',
                        message: 'Validation error, please try again. If this error persists, please contact the system administrator.'
                    }).then(function () {
                        reject(error);
                    });
                } else {
                    reject(error);
                }
            });

        });

    });

});


/**
 * generic call of pre defined actions
 * @param action
 * @param original data
 */
function call(action, data) {

    return new Promise(function (resolve, reject) {
        if (action.action !== undefined && action.action.name !== undefined && actions[action.action.name] !== undefined) {

            decrypt(action).then((action) => {


                admin.database().ref('_config/' + action.object).once('value', (snapshot) => {

                    let config = snapshot.val();
                    let configAction = config && config[action.action.name] !== undefined ? config[action.action.name] : null;

                    let model = false;

                    if (config && config['constructor'] !== undefined) {

                        eval(base64.decode(config.constructor));
                        model = new global[action.object];

                        model.loadJson(data).then(() => {

                            if (!data) {

                                actions[action.action.name](action, data, configAction, model).then(function (data) {
                                    resolve(data.response);
                                }).catch(function (error) {
                                    reject(error);
                                });

                            } else {

                                model.removeConditionProperties();
                                model.validate({skipMissingProperties: true}).then(() => {

                                    actions[action.action.name](action, data, configAction, model).then(function (data) {

                                        if (data.config) {
                                            return admin.database().ref('_config/' + action.object + "/" + action.action.name).set(data.config).then(function () {
                                                resolve(data.response);
                                            }).catch(function (error) {
                                                reject(error);
                                            });
                                        } else {
                                            resolve(data.response);
                                        }

                                    }).catch(function (error) {
                                        reject(error);
                                    });

                                }).catch((err) => {
                                    reject(err);
                                });

                            }

                        });


                    } else {
                        reject('_config constructor not set for ' + action.action.name);
                    }


                });


            });

        }

    });

}

/**
 * Decrypt secure data from frontend encryption
 * @param data
 */
function decrypt(data) {

    return new Promise(function (resolve, reject) {
        resolve(data);
    });

}




