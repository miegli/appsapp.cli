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

import * as firebase from "firebase-admin";
import {base64} from "base-64"
import {UUID} from "angular2-uuid";

export class connector {


    db: firebase.database.Database;
    watchers: any = [];
    isWatching: boolean = false;

    /**
     *
     * constructs the connector
     *
     * @return void
     *
     */
    constructor() {

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
    init(databaseURL: string, serviceAccountKey: string) {
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

    }

    /**
     * load all models from config constructors
     */
    loadModels() {

        var self = this;

        this.db.ref('_config').once('value', (snapshot) => {

            var config = snapshot.val();
            if (!self.isWatching){
                self.watch();
            }

            /**
             * first eval
             */
            Object.keys(config).forEach((model) => {
                if (config[model].constructor !== undefined) {
                    eval(base64.decode(config[model].constructor));
                }
            });


            /**
             * second eval, must be done two times because of self-referencing injections
             */
            Object.keys(config).forEach((model) => {
                if (config[model].constructor !== undefined) {
                    eval(base64.decode(config[model].constructor));
                }
            });


        });

        this.db.ref('_config').on('child_changed', (snapshot) => {

            var config = snapshot.val();
            if (config.constructor !== undefined) {
                eval(base64.decode(config.constructor));
            }
        });

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
        var u = new UUID();
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
        var u = new UUID();
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
        var u = new UUID();
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
        self.isWatching = true;

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

                let model = new global[e.object];
                model.loadJson(e.snapshot).then((data) => {

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
                                    targetData: data !== undefined && data.hasChanges() ? data.convertListPropertiesFromArrayToObject().serialize(true, true) : null
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


                }).catch((error) => {
                    console.log(error);
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