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
export declare class Connector {
    db: firebase.database.Database;
    watchers: any;
    isWatching: boolean;
    /**
     *
     * constructs the connector
     *
     * @return void
     *
     */
    constructor();
    output: {
        clear: () => void;
        log: (message: string) => void;
        figlet: (message: string) => void;
        spinner: (message: any, callback: any) => any;
    };
    /**
     *
     * init app
     *
     * @param string databaseURL of firebase database endpoint
     * @param string serviceAccountKey file content as json
     * @return mixed
     *
     */
    init(databaseURL: string, serviceAccountKey: string): this;
    /**
     * load all models from config constructors
     */
    loadModels(): void;
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
    message(userid: any, title: any, time: any): void;
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
    error(userid: any, title: any, time: any): void;
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
    warning(userid: any, title: any, time: any): void;
    /**
     *
     * watch for firebase events
     *
     * @return void
     *
     */
    watch(): void;
    /**
     *
     * execute queue from snapshot data
     * @param snapshot
     * @return void
     *
     */
    executeQueue(snapshot: any): void;
    /**
     * watch events
     * @param object params
     * @param function callback function (data,deferred)
     */
    on(params: any, callback: any): this;
}
