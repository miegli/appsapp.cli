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

'use strict';

const uuidv1 = require('uuid/v1');
const base64 = require('base-64');
const path = require('path');

process.argv.forEach((val, index) => {
    require('app-module-path').addPath(path.dirname(val)+"/node_modules");
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


class connector {

    /**
     *
     * constructs the connector
     *
     * @return void
     *
     */
    constructor() {
        this.admin = require('firebase-admin');
    }


    /**
     *
     * init app
     *
     * @param string databaseURL of firebase database endpoint
     * @param string serviceAccountKey file (relative path)
     * @return mixed
     *
     */
    init(databaseURL, serviceAccountKey) {
        /**
         * initialize firebase admin
         */
        this.admin.initializeApp({
            credential: this.admin.credential.cert(require(serviceAccountKey)),
            databaseURL: databaseURL
        });
        this.db = this.admin.database();
        this.firestore = this.admin.firestore();
        this.watchers = [];
        this.watch();
        return this;

    }

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
    message(userid, title, time) {

        var self = this;
        var u = uuidv1();
        this.db.ref('user/' + userid + '/notification/' + u).set(title);
        setTimeout(function () {
            self.db.ref('user/' + userid + '/notification/' + u).remove();
        }, time ? time : 3000);

    }

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
    error(userid, title, time) {

        var self = this;
        var u = uuidv1();
        this.db.ref('user/' + userid + '/error/' + u).set(title);
        setTimeout(function () {
            self.db.ref('user/' + userid + '/error/' + u).remove();
        }, time ? time : 3000);
    }

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
    warning(userid, title, time) {


        var self = this;
        var u = uuidv1();
        this.db.ref('user/' + userid + '/warning/' + u).set(title);
        setTimeout(function () {
            self.db.ref('user/' + userid + '/warning/' + u).remove();
        }, time ? time : 3000);

    }


    /**
     *
     * watch for firebase events
     *
     * @return void
     *
     */
    watch() {
        /**
         * watch for events and connect signal slots
         */
        var self = this;

        this.db.ref("_queue").on(
            "child_added",
            function (snapshot) {
                self.executeQueue(snapshot);
            }
        );

    }


    /**
     *
     * execute queue from snapshot data
     * @param snapshot
     * @return void
     *
     */
    executeQueue(snapshot) {

        var self = this;
        var e = snapshot.val();
        var eventId = snapshot.key;

        self.watchers.forEach(function (watcher) {


            if (
                (e.object === watcher.object || watcher.object === null) &&
                (e.project === watcher.project || watcher.project === null) &&
                ((e.action.data !== undefined && e.action.data.name === watcher.action) || watcher.action === null)
            ) {


                // convert json to real model object
                self.db.ref('_config/' + e.object).once('value', (snapshot) => {

                    let config = snapshot.val();
                    eval(base64.decode(config.constructor));

                    let model = new global[e.object];
                    model.loadJson(e.snapshot).then((data) => {

                        if (config && config['constructor'] !== undefined) {
                            watcher.callback({
                                user: e.user,
                                object: e.object,
                                objectId: e.objectid,
                                project: e.project,
                                action: e.action,
                                eventId: eventId,
                            }, data, {
                                'resolve': function () {

                                    data.validate().then(() => {
                                        e.action.state = 'done';
                                        self.db.ref('_queue/' + eventId).update({
                                            action: e.action,
                                            targetData: data !== undefined ? data.serialize(true, true) : null,
                                            targetMessage: 'test'
                                        });
                                    }).catch((error) => {
                                        e.action.state = 'error';
                                        self.db.ref('_queue/' + eventId).update({
                                            action: e.action,
                                            targetData: null,
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
                        } else {
                            console.log('error ' + e.object + ' object model invalide');
                        }

                    }).catch((error) => {
                        console.log(error);
                    });


                });


            }


        });


    }

    /**
     * watch events
     * @param object params
     * @param function callback function (data,deferred)
     */
    on(params, callback) {

        this.watchers.push(
            {
                object: params.object !== undefined ? params.object : null,
                action: params.action !== undefined ? params.action : null,
                project: params.project !== undefined ? params.project : null,
                callback: callback
            }
        );

        return this;
    }


}

module.exports = new connector;

/**
 *
 * constructs promise
 * @return mixed
 *
 */
function Deferred() {
    // update 062115 for typeof
    if (typeof(Promise) != 'undefined' && Promise.defer) {
        //need import of Promise.jsm for example: Cu.import('resource:/gree/modules/Promise.jsm');
        return new Deferred();
    } else if (typeof(PromiseUtils) != 'undefined' && PromiseUtils.defer) {
        //need import of PromiseUtils.jsm for example: Cu.import('resource:/gree/modules/PromiseUtils.jsm');
        return PromiseUtils.defer();
    } else {
        /* A method to resolve the associated Promise with the value passed.
         * If the promise is already settled it does nothing.
         *
         * @param {anything} value : This value is used to resolve the promise
         * If the value is a Promise then the associated promise assumes the state
         * of Promise passed as value.
         */
        this.resolve = null;

        /* A method to reject the assocaited Promise with the value passed.
         * If the promise is already settled it does nothing.
         *
         * @param {anything} reason: The reason for the rejection of the Promise.
         * Generally its an Error object. If however a Promise is passed, then the Promise
         * itself will be the reason for rejection no matter the state of the Promise.
         */
        this.reject = null;

        /* A newly created Pomise object.
         * Initially in pending state.
         */
        this.promise = new Promise(function (resolve, reject) {
            this.resolve = resolve;
            this.reject = reject;
        }.bind(this));
        Object.freeze(this);
    }
}