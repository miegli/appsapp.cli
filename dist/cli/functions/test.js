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
 * set global appsapp backend mode
 */
global['appsapp-backend-mode'] = true;

/**
 * load core modules
 */
const admin = require('firebase-admin');


var serviceAccount = require('/Users/pamegli/Documents/projects/bsh.slmde/frontend/app/serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://test-32b81.firebaseio.com'
});


const uuidV1 = require('uuid/v1');
const base64 = require('base-64');

/**
 * cached configuration
 */
let configurationCache = {};

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
 * load all models from config constructors
 */

var self = this;


admin.database().ref('_config').on('value', (snapshot) => {

    createConfigurationCacheByConfigSnapshot(snapshot);
    initModelByConstructorSnapshot(snapshot);

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
 * Connect realtime database for watching and execute events / actions
 */
function test(original,identifier) {

    const actiondata = {
        'date': original.date,
        'project': original.project,
        'object': original.object,
        'objectid': original.objectid,
        'user': original.user,
        'action': original.action,
        'actionid': original.actionid,
        'source': original.source,
        'snapshot': original.snapshot !== undefined ? original.snapshot : null,
        'target': original.target ? original.target : null
    };



    return dispatchEvent(original, identifier, actiondata).then(function () {
        return true;
    }).catch(function (error) {
      return error;
    });

}


/**
 * Call action by given event queue object
 */
function dispatchEvent(original, identifier, actiondata) {

    return new Promise(function (resolve, reject) {

        const date = new Date();

        admin.database().ref('_events/' + identifier + "/dispatched").set(date.getTime()).then(function () {


            call(actiondata, original.snapshot !== undefined ? original.snapshot : null).then((data) => {



                admin.database().ref('_events/' + identifier).remove().then(function () {
                    if (actiondata.target !== undefined && actiondata.target) {
                        admin.database().ref(actiondata.target + "/action/" + actiondata.actionid).set(data).then(function () {
                            admin.database().ref(actiondata.target + "/action/" + actiondata.actionid).remove().then(() => {
                                resolve(data);
                            }).catch((error) => {
                                reject(error);
                            });
                        }).catch((error) => {
                            reject(error);
                        });
                    } else {
                        resolve(data);
                    }
                }).catch((error) => {
                    reject(error);
                });

            }).catch((error) => {
                console.log(error);
                admin.database().ref('_events/' + identifier).remove().then(function () {
                    if (actiondata.target !== undefined && actiondata.target) {
                        admin.database().ref(actiondata.target + "/action/" + actiondata.actionid).set({
                            state: 'error',
                            message: 'Validation error, please try again. If this error persists, please contact the system administrator.'
                        }).then(function () {
                            console.log(error);
                            reject(error);
                        }).catch((error) => {
                            reject(error);
                        });
                    } else {
                        reject(error);
                    }
                }).catch((error) => {
                    reject(error);
                });
            });


        }).catch((error) => {
            reject(error);
        });

    });
}

/**
 * generic call of pre defined actions
 * @param action
 * @param original data
 */
function call(action, data) {

    return new Promise(function (resolve, reject) {
        if (action.action !== undefined && action.action.name !== undefined && actions[action.action.name] !== undefined) {



            decrypt(action).then((action) => {

                getModel(action.object).then((model) => {

                    console.log(3);

                    model.loadJson(data).then((model) => {

                        console.log(4, action.action.name);

                        if (!data) {

                            actions[action.action.name](action, data, getConfiguration(action.object), model).then(function (data) {
                                resolve(data.response);
                            }).catch(function (error) {
                                reject(error);
                            });

                        } else {

                            model.removeConditionProperties();
                            model.validate().then(() => {

                                actions[action.action.name](action, data,  getConfiguration(action.object), model).then(function (data) {

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
                                console.log(err);
                                reject(err);
                            });

                        }

                    }).catch((error) => {
                        console.log(error);
                        reject('validation error ' + action.action.name);
                    });


                }).catch((error) => {
                    reject('model could not be loaded ' + action.action.name);
                });


            }).catch((error) => {
                reject(error);
            });


        } else {
            reject('internal error: action unknown');
        }

    })


}


/**
 * create model by given constructor name
 * @param constructorName
 */
function getModel(constructorName) {


    return new Promise(function (resolve, reject) {

        let model = null;

        if (global[constructorName] !== undefined) {

            try {
                model = new global[constructorName];
            }
            catch (e) {
                reject(model);
            }
            resolve(model);

        } else {

            admin.database().ref('_config').once('value', (snapshot) => {

                initModelByConstructorSnapshot(snapshot);

                try {
                    model = new global[constructorName];
                }
                catch (e) {
                    reject(model);
                }
                resolve(model);

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

/**
 * get configuration by given constructorName
 * @param constructorName
 */
function getConfiguration(constructorName) {

    return configurationCache[constructorName] === undefined ? null : configurationCache[constructorName];

}

/**
 * update configuration cache by config snapshot
 * @param snapshot
 */
function createConfigurationCacheByConfigSnapshot(snapshot) {

    var config = snapshot.val(), self = this;

    Object.keys(config).forEach((constructorName) => {
        configurationCache[constructorName] = config[constructorName];
    });

}

/**
 * init model by constructor snapshot
 * @param snapshot
 */
function initModelByConstructorSnapshot(snapshot) {

    var config = snapshot.val();

    /**
     * first eval
     */
    Object.keys(config).forEach((model) => {


        if (config[model].constructor !== undefined) {
            try {
                eval(Buffer.from(config[model].constructor, 'base64').toString());
            }
            catch (e) {
                // skip
            }
        }
    });
    /**
     * second eval, must be done two times because of self-referencing injections
     */
    Object.keys(config).forEach((model) => {


        if (config[model].constructor !== undefined) {
            try {
                eval(Buffer.from(config[model].constructor, 'base64').toString());
            }
            catch (e) {
                console.log(e);
            }
        }
    });

    return true;

}




test({
        "action" : {
            "data" : {
                "identifier" : "aa4d2acd-5887-9eba-574d-b0099dcee3a7",
                "name" : "load"
            },
            "name" : "custom",
            "state" : "requested"
        },
        "actionid" : "e72de41d078871d21ddd8301f3538e99e993c097",
        "date" : 1521202985871,
        "dispatched" : 1521202986661,
        "object" : "MitarbeiterProjekte",
        "objectid" : "MitarbeiterProjekte",
        "project" : "project",
        "snapshot" : {
            "Mitarbeiter" : {
                "Be" : {
                    "MitarbeiterKuerzel" : "Bel",
                    "MitarbeiterName" : "Bühler",
                    "Mitarbeiter_SLBenutzer" : "Be",
                    "Mitarbeitervorname" : "Eliane"
                },
                "Bj" : {
                    "MitarbeiterKuerzel" : "Bj",
                    "MitarbeiterName" : "Bijelic",
                    "Mitarbeiter_SLBenutzer" : "Bj",
                    "Mitarbeitervorname" : "Juro "
                },
                "Hs" : {
                    "MitarbeiterKuerzel" : "Hus",
                    "MitarbeiterName" : "Hug",
                    "Mitarbeiter_SLBenutzer" : "Hs",
                    "Mitarbeitervorname" : "Silvan"
                },
                "Ld" : {
                    "MitarbeiterKuerzel" : "Lad",
                    "MitarbeiterName" : "Langenberg",
                    "Mitarbeiter_SLBenutzer" : "Ld",
                    "Mitarbeitervorname" : "Danny"
                },
                "Mr" : {
                    "MitarbeiterKuerzel" : "Mre",
                    "MitarbeiterName" : "Müller",
                    "Mitarbeiter_SLBenutzer" : "Mr",
                    "Mitarbeitervorname" : "René"
                },
                "Po" : {
                    "MitarbeiterKuerzel" : "Por",
                    "MitarbeiterName" : "Portmann",
                    "Mitarbeiter_SLBenutzer" : "Po",
                    "Mitarbeitervorname" : "Ursula "
                },
                "SA" : {
                    "MitarbeiterKuerzel" : "Soe",
                    "MitarbeiterName" : "Schöpf",
                    "Mitarbeiter_SLBenutzer" : "SA",
                    "Mitarbeitervorname" : "André"
                },
                "Si" : {
                    "MitarbeiterKuerzel" : "Sig",
                    "MitarbeiterName" : "Sigrist",
                    "Mitarbeiter_SLBenutzer" : "Si",
                    "Mitarbeitervorname" : "Alois"
                },
                "So" : {
                    "MitarbeiterKuerzel" : "Sos",
                    "MitarbeiterName" : "Solano",
                    "Mitarbeiter_SLBenutzer" : "So",
                    "Mitarbeitervorname" : "Sebastiano"
                },
                "Zy" : {
                    "MitarbeiterKuerzel" : "Zy",
                    "MitarbeiterName" : "Zwyssig",
                    "Mitarbeiter_SLBenutzer" : "Zy",
                    "Mitarbeitervorname" : "Walter"
                }
            },
            "Projekte" : {
                "10-0284" : {
                    "Id" : 4,
                    "Projektbezeichnung" : "Quecksilberabscheidung",
                    "Projektnummer" : "10-0284"
                },
                "30-0138" : {
                    "Id" : 3,
                    "Mitarbeiter" : [ {
                        "MitarbeiterKuerzel" : "Bj",
                        "MitarbeiterName" : "Bijelic",
                        "Mitarbeiter_SLBenutzer" : "Bj",
                        "Mitarbeitervorname" : "Juro "
                    }, {
                        "MitarbeiterKuerzel" : "Bel",
                        "MitarbeiterName" : "Bühler",
                        "Mitarbeiter_SLBenutzer" : "Be",
                        "Mitarbeitervorname" : "Eliane"
                    } ],
                    "Projektbezeichnung" : "Umbau SED-Messung-DMS",
                    "Projektnummer" : "30-0138"
                }
            }
        },
        "source" : "database",
        "target" : "session/k4I2jX6DJnXDTCUdWe2AoDhRRfu1/project/MitarbeiterProjekte/MitarbeiterProjekte",
        "user" : "k4I2jX6DJnXDTCUdWe2AoDhRRfu1"
    },'test');
