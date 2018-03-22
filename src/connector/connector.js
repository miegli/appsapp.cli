"use strict";
/**
 * Copyright (c) 2017 by Michael Egli
 *
 *
 *
 * firebase database structure
 *
 * - user
 * --- {userid}
 * ----- storage
 * ------ {object} business objects
 * ------- {objectid} business object identifier / single record
 * --------- version (mixed, timestamp|uui|identifier) change it to fetch current content data from api
 * --------- data (mixed)
 * ---------- bind (mixed) json data of current version (is three way binding to client)
 * ---------- stable (mixed) json data of current version (is last version of fetched data)
 * --------- saved (mixed, timestamp|uui|identifier) change or set it to save current bind data back to api
 * ----- profile
 * ------ userid (integer)
 * ------ name (string)
 * ------ lastname (string)
 * ------ email (string)
 * ----- history (old and new values are stored here)
 * ----- notification (realtime notification to user)
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
var firebase = require("firebase-admin");
var angular2_uuid_1 = require("angular2-uuid");
var path = require("path");
var chalk = require("chalk");
var clear = require("clear");
var clui = require("clui");
var figlet = require("figlet");
process.argv.forEach(function (val, index) {
    require('app-module-path').addPath(path.dirname(val) + path.sep + 'node_modules');
});
/**
 * constructor loader
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) {
            d.__proto__ = b;
        }) ||
        function (d, b) {
            for (var p in b)
                if (b.hasOwnProperty(p))
                    d[p] = b[p];
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
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
        r = Reflect.decorate(decorators, target, key, desc);
    else
        for (var i = decorators.length - 1; i >= 0; i--)
            if (d = decorators[i])
                r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
        return Reflect.metadata(k, v);
};
var Connector = /** @class */ (function () {
    /**
     *
     * constructs the connector
     *
     * @return void
     *
     */
    function Connector() {
        this.watchers = [];
        this.isWatching = false;
        this.output = {
            clear: function () {
                clear();
            },
            log: function (message) {
                console.log(message);
            },
            figlet: function (message) {
                console.log(chalk.default(figlet.textSync(message, { horizontalLayout: 'full' })));
            },
            spinner: function (message, callback) {
                var status = new clui.Spinner(message);
                status.start();
                return callback(status);
            }
        };
    }
    /**
     *
     * init app
     *
     * @param string databaseURL of firebase database endpoint
     * @param string serviceAccountKey file content as json
     * @return mixed
     *
     */
    Connector.prototype.init = function (databaseURL, serviceAccountKey) {
        /**
         * initialize firebase admin
         */
        firebase.initializeApp({
            credential: firebase.credential.cert(serviceAccountKey),
            databaseURL: databaseURL
        });
        this.db = firebase.database();
        this.watchers = [];
        this.loadModels();
        return this;
    };
    /**
     * load all models from config constructors
     */
    Connector.prototype.loadModels = function () {
        var self = this;
        this.db.ref('_config').once('value', function (snapshot) {
            var config = snapshot.val();
            if (!self.isWatching) {
                self.watch();
            }
            /**
             * first eval
             */
            Object.keys(config).forEach(function (model) {
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
            Object.keys(config).forEach(function (model) {
                if (config[model].constructor !== undefined) {
                    try {
                        eval(Buffer.from(config[model].constructor, 'base64').toString());
                    }
                    catch (e) {
                        console.log(e);
                    }
                }
            });
        });
        this.db.ref('_config').on('child_changed', function (snapshot) {
            var config = snapshot.val();
            if (config.constructor !== undefined) {
                try {
                    eval(Buffer.from(config.constructor, 'base64').toString());
                }
                catch (e) {
                    // skip
                }
                try {
                    eval(Buffer.from(config.constructor, 'base64').toString());
                }
                catch (e) {
                    // skip
                }
            }
        });
    };
    /**
     *
     * push notification to user if he's online
     *
     * @param string userid
     * @param string title
     * @param integer time
     * @return void
     *
     */
    Connector.prototype.message = function (userid, title, time) {
        var self = this;
        var u = new angular2_uuid_1.UUID();
        this.db.ref('user/' + userid + '/notification/' + u).set(title);
        setTimeout(function () {
            self.db.ref('user/' + userid + '/notification/' + u).remove();
        }, time ? time : 3000);
    };
    /**
     *
     * push error notification to user if he's online
     *
     * @param string userid
     * @param string title
     * @param integer time
     * @return void
     *
     */
    Connector.prototype.error = function (userid, title, time) {
        var self = this;
        var u = new angular2_uuid_1.UUID();
        this.db.ref('user/' + userid + '/error/' + u).set(title);
        setTimeout(function () {
            self.db.ref('user/' + userid + '/error/' + u).remove();
        }, time ? time : 3000);
    };
    /**
     *
     * push warning notification to user if he's online
     *
     * @param string userid
     * @param string title
     * @param integer time
     * @return void
     *
     */
    Connector.prototype.warning = function (userid, title, time) {
        var self = this;
        var u = new angular2_uuid_1.UUID();
        this.db.ref('user/' + userid + '/warning/' + u).set(title);
        setTimeout(function () {
            self.db.ref('user/' + userid + '/warning/' + u).remove();
        }, time ? time : 3000);
    };
    /**
     *
     * watch for firebase events
     *
     * @return void
     *
     */
    Connector.prototype.watch = function () {
        /**
         * watch for events and connect signal slots
         */
        var self = this;
        self.isWatching = true;
        this.db.ref("_queue").on("child_added", function (snapshot) {
            self.executeQueue(snapshot);
        });
    };
    /**
     *
     * execute queue from snapshot data
     * @param snapshot
     * @return void
     *
     */
    Connector.prototype.executeQueue = function (snapshot) {
        var self = this;
        var e = snapshot.val();
        var eventId = snapshot.key;
        self.watchers.forEach(function (watcher) {
            if ((e.object === watcher.object || watcher.object === null) &&
                (e.project === watcher.project || watcher.project === null) &&
                ((e.action.data !== undefined && e.action.data.name === watcher.action) || watcher.action === null)) {
                if (e.object === undefined || e.action.state == 'done') {
                    self.db.ref('_queue/' + eventId).remove(function () {
                        // removed old queue entry
                    });
                }
                else {
                    var model = new global[e.object], data_1 = model.loadJson(e.snapshot);
                    watcher.callback({
                        user: e.user,
                        object: e.object,
                        objectId: e.objectid,
                        project: e.project,
                        action: e.action,
                        eventId: eventId,
                    }, data_1, {
                        'resolve': function () {
                            data_1.validate().then(function () {
                                e.action.state = 'done';
                                if (data_1.hasChanges()) {
                                    self.db.ref('_queue/' + eventId).update({
                                        action: e.action,
                                        targetData: data_1 !== undefined ? data_1.convertListPropertiesFromArrayToObject().serialize(true, true) : null
                                    });
                                }
                                else {
                                    self.db.ref('_queue/' + eventId).update({
                                        action: e.action
                                    });
                                }
                            }).catch(function (error) {
                                e.action.state = 'error';
                                self.db.ref('_queue/' + eventId).update({
                                    action: e.action,
                                    targetMessage: 'Validation error'
                                });
                                console.log(error);
                            });
                        },
                        'reject': function (error) {
                            e.action.state = 'error';
                            self.db.ref('_queue/' + eventId).update({
                                action: e.action,
                                targetData: null,
                                targetMessage: error !== undefined ? error : null
                            });
                        }
                    });
                }
            }
        });
    };
    /**
     * watch events
     * @param object params
     * @param function callback function (data,deferred)
     */
    Connector.prototype.on = function (params, callback) {
        this.watchers.push({
            object: params.object !== undefined ? params.object : null,
            action: params.action !== undefined ? params.action : null,
            project: params.project !== undefined ? params.project : null,
            callback: callback
        });
        return this;
    };
    return Connector;
}());
exports.Connector = Connector;
