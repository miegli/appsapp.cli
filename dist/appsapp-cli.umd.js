(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('class-validator'), require('class-transformer'), require('angular2-uuid'), require('object-hash'), require('rxjs'), require('unirest'), require('class-validator/decorator/decorators')) :
	typeof define === 'function' && define.amd ? define(['exports', 'class-validator', 'class-transformer', 'angular2-uuid', 'object-hash', 'rxjs', 'unirest', 'class-validator/decorator/decorators'], factory) :
	(factory((global['appsapp-cli'] = {}),global.classValidator,global.classTransformer,global.angular2Uuid,global.objectHash,global.rxjs,global.Unirest,global.decorators));
}(this, (function (exports,classValidator,classTransformer,angular2Uuid,objectHash,rxjs,Unirest,decorators) { 'use strict';

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @record
 */

/**
 * @record
 */

/**
 * @record
 */

/**
 * @record
 */

var PersistableModel = /** @class */ (function () {
    /**
     * PersistanceManager as an optional argument when changes were persisted to stable database
     */
    function PersistableModel() {
        var _this = this;
        this.__isLoaded = false;
        this.__isAutosave = false;
        this.__uuid = '';
        this.__firebaseDatabaseRoot = 'session';
        this.__bindings = {};
        this.__bindingsObserver = {};
        this.__validator = {};
        this.__validatorObserver = {};
        this.__edited = {};
        this.__editedObservableCallbacks = [];
        this.__editedObservableObservers = [];
        this.__temp = {};
        this.__forceUpdateProperty = {};
        this.__isOnline = true;
        this.__validationErrors = {};
        this.__metadata = [];
        this.__metadataCache = {};
        this._hasPendingChanges = false;
        this.__conditionBindings = {};
        this.__conditionActionIfMatches = {};
        this.__conditionActionIfMatchesAction = {};
        this.__conditionActionIfMatchesObserver = {};
        this.__conditionActionIfMatchesRemovedProperties = {};
        this.__conditionContraintsProperties = {};
        this.__conditionContraintsPropertiesValue = {};
        this.__conditionContraintsAffectedProperties = {};
        this.__hashedValues = {};
        this.__listArrays = {};
        this.__metadata = classValidator.getFromContainer(classValidator.MetadataStorage).getTargetValidationMetadatas(this.constructor, '');
        // check if all loaded metadata has corresponding properties
        this.__metadata.forEach(function (metadata) {
            if (_this[metadata.propertyName] == undefined) {
                _this[metadata.propertyName] = null;
            }
        });
        this.transformAllProperties();
        this.__init();
    }
    /**
     *
     * @return {?}
     */
    PersistableModel.prototype.__init = /**
     *
     * @return {?}
     */
    function () {
        var _this = this;
        var /** @type {?} */ self = this;
        /**
                 * create observerable and observer for handling the models data changes
                 */
        this.__editedObservable = new rxjs.Observable(function (observer) {
            self.__editedObserver = observer;
        });
        /**
                 * create observerable and observer for handling the models data changes
                 */
        this.__observable = new rxjs.Observable(function (observer) {
            self.__observer = observer;
            self.__observer.next(_this);
        });
        /**
                 * creates and update bindings for getProperty()-Method
                 */
        this.__observable.subscribe(function (next) {
            if (!self.hasPendingChanges() || self.getFirebaseDatabase() === undefined) {
                if (self.__bindingsObserver) {
                    self.__editedObservableObservers.forEach(function (callback) {
                        if (next[callback.property] !== undefined && callback.first === undefined) {
                            callback.callback(next[callback.property]);
                            callback.first = true;
                        }
                    });
                    Object.keys(self.__bindingsObserver).forEach(function (property) {
                        if (!self.hasChanges(property) || self.__forceUpdateProperty[property] !== undefined) {
                            if (next[property] !== undefined) {
                                self.executeConditionValidatorCircular(property);
                                self.__bindingsObserver[property].next(next[property]);
                            }
                        }
                    });
                }
            }
        });
    };
    /**
     * get http client
     * @return {?} HttpClient
     */
    PersistableModel.prototype.getHttpClient = /**
     * get http client
     * @return {?} HttpClient
     */
    function () {
        return this.__httpClient;
    };
    /**
     * set http client
     * @param {?} http
     * @return {?}
     */
    PersistableModel.prototype.setHttpClient = /**
     * set http client
     * @param {?} http
     * @return {?}
     */
    function (http) {
        this.__httpClient = http;
        return this;
    };
    /**
     * update property
     * @param {?} property
     * @param {?} value
     * @return {?}
     */
    PersistableModel.prototype.update = /**
     * update property
     * @param {?} property
     * @param {?} value
     * @return {?}
     */
    function (property, value) {
        var /** @type {?} */ observer = this.setProperty(property, value).setHasNoChanges(property).getPropertyObserver(property);
        if (observer) {
            observer.next(value);
        }
        try {
            delete this.__bindings[property];
        }
        catch (/** @type {?} */ e) {
            // e
        }
        return this;
    };
    /**
     * call next method on observer
     * @return {?}
     */
    PersistableModel.prototype.emit = /**
     * call next method on observer
     * @return {?}
     */
    function () {
        if (this.__observer) {
            this.__observer.next(this);
        }
        return this;
    };
    /**
     * save with optional observable
     * @param {?=} action
     * @return {?}
     */
    PersistableModel.prototype.saveWithPromise = /**
     * save with optional observable
     * @param {?=} action
     * @return {?}
     */
    function (action) {
        var /** @type {?} */ self = this;
        return new Promise(function (resolve, reject) {
            self.save(action).subscribe(function (next) {
            }, function (error) {
                reject(error);
            }, function () {
                resolve();
            });
        });
    };
    /**
     * execute cation
     * @param {?} action
     * @return {?}
     */
    PersistableModel.prototype.action = /**
     * execute cation
     * @param {?} action
     * @return {?}
     */
    function (action) {
        var /** @type {?} */ self = this;
        var /** @type {?} */ observable = new rxjs.Observable(function (observer) {
            if (self.__persistenceManager) {
                self.__persistenceManager.action(self, observer, action).then(function (success) {
                    observer.complete();
                }).catch(function (error) {
                    observer.error(error);
                });
            }
            else {
                observer.error('No persistence Manger provided');
            }
        });
        return new Promise(function (resolve, reject) {
            observable.subscribe(function (next) {
            }, function (error) {
                reject(error);
            }, function () {
                resolve();
            });
        });
    };
    /**
     * trigger custom action
     * @param {?} action
     * @param {?=} interval
     * @param {?=} maxExecutions
     * @return {?}
     */
    PersistableModel.prototype.trigger = /**
     * trigger custom action
     * @param {?} action
     * @param {?=} interval
     * @param {?=} maxExecutions
     * @return {?}
     */
    function (action, interval, maxExecutions) {
        var /** @type {?} */ self = this;
        return new rxjs.Observable(function (observer) {
            if (self.__isLoaded) {
                self.getPersistenceManager().trigger(self, observer, {
                    name: 'custom',
                    data: {
                        name: action
                    }
                }, interval, maxExecutions);
            }
            else {
                self.loaded().then(function (model) {
                    self.getPersistenceManager().trigger(model, observer, {
                        name: 'custom',
                        data: {
                            name: action
                        }
                    }, interval, maxExecutions);
                });
            }
        });
    };
    /**
     * trigger a webhook url
     * @param {?} url
     * @param {?=} method
     * @param {?=} type
     * @return {?}
     */
    PersistableModel.prototype.webhook = /**
     * trigger a webhook url
     * @param {?} url
     * @param {?=} method
     * @param {?=} type
     * @return {?}
     */
    function (url, method, type) {
        var /** @type {?} */ self = this;
        return new rxjs.Observable(function (observer) {
            if (self.__isLoaded) {
                self.getPersistenceManager().trigger(self, observer, {
                    name: 'webhook',
                    data: {
                        url: url,
                        method: method,
                        type: type
                    }
                });
            }
            else {
                self.loaded().then(function (model) {
                    self.getPersistenceManager().trigger(model, observer, {
                        name: 'webhook',
                        data: {
                            url: url,
                            method: method,
                            type: type
                        }
                    });
                });
            }
        });
    };
    /**
     * save with optional observable
     * @param {?=} action
     * @return {?}
     */
    PersistableModel.prototype.save = /**
     * save with optional observable
     * @param {?=} action
     * @return {?}
     */
    function (action) {
        var /** @type {?} */ self = this, /** @type {?} */ observer = null;
        if (typeof action === 'string') {
            action = {
                name: 'custom',
                data: {
                    name: action
                }
            };
        }
        self.executeSave(action).subscribe(function (next) {
            if (observer) {
                observer.next(next);
            }
        }, function (error) {
            if (observer) {
                observer.error(error);
            }
        }, function () {
            if (observer) {
                observer.complete();
            }
        });
        return new rxjs.Observable(function (o) {
            observer = o;
        });
    };
    /**
     * save model and persist if is persistable
     * @param {?=} action
     * @return {?}
     */
    PersistableModel.prototype.executeSave = /**
     * save model and persist if is persistable
     * @param {?=} action
     * @return {?}
     */
    function (action) {
        var /** @type {?} */ self = this;
        Object.keys(self.__edited).forEach(function (property) {
            self[property] = self.__edited[property];
        });
        return new rxjs.Observable(function (observer) {
            self.setHasPendingChanges(true, action);
            if (self.__persistenceManager) {
                self.__persistenceManager.save(self, observer, action).then(function (success) {
                    self.__edited = {};
                    if (action) {
                        if (self.isOnline()) {
                            observer.next(self.getMessage('submitted'));
                        }
                        else {
                            observer.next(self.getMessage('submittedInBackground'));
                        }
                    }
                    else {
                        observer.complete();
                    }
                }).catch(function (error) {
                    self.__edited = {};
                    observer.error(error);
                });
            }
            else {
                observer.error('No persistence Manger provided');
                self.__edited = {};
            }
        });
    };
    /**
     * resets model
     * @return {?}
     */
    PersistableModel.prototype.reset = /**
     * resets model
     * @return {?}
     */
    function () {
        var /** @type {?} */ self = this;
        Object.keys(self.getProperties()).forEach(function (property) {
            self.transformTypeFromMetadata(property, '');
        });
        self.__edited = {};
        return this;
    };
    /**
     * removes edited states
     * @return {?}
     */
    PersistableModel.prototype.removeEditedState = /**
     * removes edited states
     * @return {?}
     */
    function () {
        this.__edited = {};
        return this;
    };
    /**
     * get models observer
     * @return {?}
     */
    PersistableModel.prototype.getObserver = /**
     * get models observer
     * @return {?}
     */
    function () {
        return this.__observer;
    };
    /**
     * get models obervable
     * @return {?}
     */
    PersistableModel.prototype.getObservable = /**
     * get models obervable
     * @return {?}
     */
    function () {
        return this.__observable;
    };
    /**
     * set uuid
     * @param {?=} uuid
     * @return {?}
     */
    PersistableModel.prototype.setUuid = /**
     * set uuid
     * @param {?=} uuid
     * @return {?}
     */
    function (uuid) {
        this.__uuid = uuid !== undefined ? uuid : angular2Uuid.UUID.UUID();
        return this;
    };
    /**
     * get uuid
     * @return {?}
     */
    PersistableModel.prototype.getUuid = /**
     * get uuid
     * @return {?}
     */
    function () {
        return this.__uuid;
    };
    /**
     * get models constructors name as an object identifier
     * return {string}
     * @return {?}
     */
    PersistableModel.prototype.getObjectIdentifier = /**
     * get models constructors name as an object identifier
     * return {string}
     * @return {?}
     */
    function () {
        return this.constructor.name;
    };
    /**
     * set firebaseDatabase
     * @param {?} firebaseDatabase
     * @return {?}
     */
    PersistableModel.prototype.setFirebaseDatabase = /**
     * set firebaseDatabase
     * @param {?} firebaseDatabase
     * @return {?}
     */
    function (firebaseDatabase) {
        this.__firebaseDatabase = firebaseDatabase;
        var /** @type {?} */ self = this;
        var /** @type {?} */ connectedRef = this.__firebaseDatabase.app.database().ref(".info/connected");
        connectedRef.on("value", function (snap) {
            self.__isOnline = snap.val();
            if (self.__persistenceManager && self.__isOnline) {
                self.__persistenceManager.getObserver().next({ 'action': 'connected' });
            }
            if (self.__persistenceManager && !self.__isOnline) {
                self.__persistenceManager.getObserver().next({ 'action': 'disconnected' });
            }
        });
        if (this.getPersistenceManager() !== undefined) {
            if (!this.getPersistenceManager()._isConnected) {
                this.getPersistenceManager().getFirebase().getAuth().then(function (auth) {
                    auth.authState.subscribe(function (user) {
                        if (user && self.__persistenceManager) {
                            self.__persistenceManager.getObserver().next({ 'action': 'connected' });
                        }
                        self.emit();
                    });
                });
                this.getPersistenceManager().setIsConnected();
            }
        }
        return this;
    };
    /**
     * get firebase database
     * @return {?}
     */
    PersistableModel.prototype.getFirebaseDatabase = /**
     * get firebase database
     * @return {?}
     */
    function () {
        return this.__firebaseDatabase;
    };
    /**
     * set firebase database path
     * @param {?} path
     * @return {?}
     */
    PersistableModel.prototype.setFirebaseDatabasePath = /**
     * set firebase database path
     * @param {?} path
     * @return {?}
     */
    function (path) {
        this.__firebaseDatabasePath = path;
        this.registerConditionValidators(false);
        return this;
    };
    /**
     * get firebase database path
     * @return {?}
     */
    PersistableModel.prototype.getFirebaseDatabasePath = /**
     * get firebase database path
     * @return {?}
     */
    function () {
        return this.__firebaseDatabasePath;
    };
    /**
     * get firebase session data path
     * @param {?} path
     * @return {?} string
     */
    PersistableModel.prototype.getFirebaseDatabaseSessionPath = /**
     * get firebase session data path
     * @param {?} path
     * @return {?} string
     */
    function (path) {
        var /** @type {?} */ a = path.split("/");
        var /** @type {?} */ path = '';
        var /** @type {?} */ i = 0;
        a.forEach(function (segment) {
            if (i == 3) {
                path = path + '/data';
            }
            path = path + '/' + segment;
            i++;
        });
        return this.__firebaseDatabaseRoot + '/' + this.getFirebaseDatabasePath().substr(this.__firebaseDatabaseRoot.length + 1).split("/")[0] + '/' + this.getFirebaseDatabasePath().substr(this.__firebaseDatabaseRoot.length + 1).split("/")[1] + path.substr(1);
    };
    /**
     * set firebaseDatabaseObject
     * @param {?} firebaseDatabaseObject
     * @return {?}
     */
    PersistableModel.prototype.setFirebaseDatabaseObject = /**
     * set firebaseDatabaseObject
     * @param {?} firebaseDatabaseObject
     * @return {?}
     */
    function (firebaseDatabaseObject) {
        this.__angularFireObject = firebaseDatabaseObject;
        return this;
    };
    /**
     * get firebaseDatabaseObject
     * @return {?}
     */
    PersistableModel.prototype.getFirebaseDatabaseObject = /**
     * get firebaseDatabaseObject
     * @return {?}
     */
    function () {
        return this.__angularFireObject;
    };
    /**
     * get firebaseDatabase prefix
     * @return {?} string
     */
    PersistableModel.prototype.getFirebaseDatabaseRoot = /**
     * get firebaseDatabase prefix
     * @return {?} string
     */
    function () {
        return this.__firebaseDatabaseRoot;
    };
    /**
     * set firebase databse path prefix
     * @param {?} path
     * @return {?}
     */
    PersistableModel.prototype.setFirebaseDatabaseRoot = /**
     * set firebase databse path prefix
     * @param {?} path
     * @return {?}
     */
    function (path) {
        this.__firebaseDatabaseRoot = path;
        return this;
    };
    /**
     * get property
     * @param {?} property
     * @return {?}
     */
    PersistableModel.prototype.getProperty = /**
     * get property
     * @param {?} property
     * @return {?}
     */
    function (property) {
        var /** @type {?} */ self = this;
        if (this.isInBackendMode()) {
            return self.getPropertyValue(property);
        }
        else {
            if (!self.__bindings[property]) {
                self.__bindings[property] = new rxjs.Observable(function (observer) {
                    self.__bindingsObserver[property] = observer;
                });
                if (self.__bindingsObserver[property] !== undefined) {
                    self.__bindingsObserver[property].next(self[property]);
                }
            }
            return self.__bindings[property];
        }
    };
    /**
     * get observer property for using as an binding variable
     * @param {?} property
     * @return {?}
     */
    PersistableModel.prototype.getPropertyObserver = /**
     * get observer property for using as an binding variable
     * @param {?} property
     * @return {?}
     */
    function (property) {
        if (this.__bindingsObserver[property]) {
            return this.__bindingsObserver[property];
        }
        else {
            return null;
        }
    };
    /**
     * set module provider messages
     * @param {?} messages
     * @return {?}
     */
    PersistableModel.prototype.setMessages = /**
     * set module provider messages
     * @param {?} messages
     * @return {?}
     */
    function (messages) {
        this.__messages = messages;
        return this;
    };
    /**
     * get modules providers message
     * @param {?} keyword
     * @return {?}
     */
    PersistableModel.prototype.getMessage = /**
     * get modules providers message
     * @param {?} keyword
     * @return {?}
     */
    function (keyword) {
        if (this.__messages === undefined) {
            return keyword;
        }
        return this.__messages[keyword] == undefined ? keyword : this.__messages[keyword];
    };
    /**
     * set property value for using as an binding variable
     * @param {?} property
     * @param {?} value
     * @return {?}
     */
    PersistableModel.prototype.setProperty = /**
     * set property value for using as an binding variable
     * @param {?} property
     * @param {?} value
     * @return {?}
     */
    function (property, value) {
        var _this = this;
        var /** @type {?} */ self = this, /** @type {?} */ autosave = false;
        if (this.__isAutosave && this[property] !== value) {
            autosave = true;
        }
        self.__editedObservableObservers.forEach(function (callback) {
            if (callback.property == property && _this[property] !== value) {
                callback.callback(value);
                callback.first = true;
            }
        });
        this[property] = value;
        this.__edited[property] = value;
        var /** @type {?} */ event = { property: property, value: value, model: this };
        if (this.__editedObserver) {
            this.__editedObserver.next(event);
        }
        this.executeConditionValidatorCircular(property);
        this.executeChangesWithCallback(event);
        if (autosave) {
            this.save(null);
        }
        return this;
    };
    /**
     * return current property value
     * @param {?} property
     * @param {?=} editing
     * @return {?}
     */
    PersistableModel.prototype.getPropertyValue = /**
     * return current property value
     * @param {?} property
     * @param {?=} editing
     * @return {?}
     */
    function (property, editing) {
        if (editing) {
            return this.__edited[property] ? this.__edited[property] : this[property];
        }
        else {
            return this[property];
        }
    };
    /**
     * get properties
     * @param {?=} stringify
     * @return {?}
     */
    PersistableModel.prototype.getProperties = /**
     * get properties
     * @param {?=} stringify
     * @return {?}
     */
    function (stringify) {
        var /** @type {?} */ properties = {}, /** @type {?} */ self = this;
        Object.keys(self).forEach(function (property) {
            if (property.substr(0, 1) !== '_') {
                if (stringify) {
                    properties[property] = self.__toString(property);
                }
                else {
                    properties[property] = self.getPropertyValue(property);
                }
            }
        });
        return properties;
    };
    /**
     * get properties
     * @return {?}
     */
    PersistableModel.prototype.convertListPropertiesFromArrayToObject = /**
     * get properties
     * @return {?}
     */
    function () {
        var /** @type {?} */ self = this;
        Object.keys(self).forEach(function (property) {
            if (property.substr(0, 1) !== '_' && self.getMetadataValue(property, 'isList', null, 'usePropertyAsUuid')) {
                var /** @type {?} */ tmp_1 = {}, /** @type {?} */ usePropertyAsUuid_1 = self.getMetadataValue(property, 'isList', null, 'usePropertyAsUuid');
                if (usePropertyAsUuid_1 && usePropertyAsUuid_1 !== undefined && usePropertyAsUuid_1 !== true && self.getPropertyValue(property) && self.getPropertyValue(property).length) {
                    self.getPropertyValue(property).forEach(function (val) {
                        if (val[usePropertyAsUuid_1] !== undefined) {
                            tmp_1[val[usePropertyAsUuid_1]] = val;
                        }
                    });
                    self[property] = tmp_1;
                }
            }
        });
        return this;
    };
    /**
     * get properties
     * @return {?}
     */
    PersistableModel.prototype.refreshAllListArrays = /**
     * get properties
     * @return {?}
     */
    function () {
        var _this = this;
        var /** @type {?} */ self = this;
        Object.keys(self).forEach(function (property) {
            if (property.substr(0, 1) !== '_' && self.getMetadataValue(property, 'isList', null, 'usePropertyAsUuid')) {
                _this.refreshListArray(property);
            }
        });
        return this;
    };
    /**
     * add a new list entry
     * @param {?} property
     * @param {?=} data (json object, persistable model or array of those
     * @param {?=} uuid string
     * @return {?} this
     */
    PersistableModel.prototype.add = /**
     * add a new list entry
     * @param {?} property
     * @param {?=} data (json object, persistable model or array of those
     * @param {?=} uuid string
     * @return {?} this
     */
    function (property, data, uuid) {
        var _this = this;
        var /** @type {?} */ self = this;
        if (this.getMetadataValue(property, 'isList')) {
            var /** @type {?} */ toAddModels = [];
            var /** @type {?} */ toCreateModels = [];
            if (data instanceof this.getMetadataValue(property, 'isList')) {
                toAddModels.push(data);
            }
            else if (typeof data == 'object' && data.length !== undefined) {
                data.forEach(function (d) {
                    if (d instanceof _this.getMetadataValue(property, 'isList')) {
                        toAddModels.push(d);
                    }
                    else {
                        toCreateModels.push(d);
                    }
                });
            }
            else {
                if (typeof data == 'string') {
                    var /** @type {?} */ d = [];
                    d.push(data);
                    toCreateModels.push(d);
                }
                else {
                    toCreateModels.push(data);
                }
            }
            toCreateModels.forEach(function (d) {
                if (uuid === undefined || uuid === null) {
                    uuid = d !== undefined ? d[self.getMetadataValue(property, 'isList', null, 'usePropertyAsUuid')] : null;
                }
                if (typeof d == 'object' && d.length == 1 && d[0] !== undefined) {
                    d = d[0];
                }
                var /** @type {?} */ n = null;
                if (self.isInBackendMode()) {
                    // backend mode
                    var /** @type {?} */ constructor = self.getMetadataValue(property, 'isList');
                    n = new constructor();
                    if (uuid !== undefined) {
                        n.setUuid(uuid);
                    }
                    else {
                        n.setUuid(angular2Uuid.UUID.UUID());
                    }
                    if (d !== undefined) {
                        n.loadJson(d);
                    }
                }
                else {
                    n = self.__appsAppModuleProvider.new(self.getMetadataValue(property, 'isList'), uuid, d);
                    var /** @type {?} */ usePropertyAsUuid = self.getMetadataValue(property, 'isList', null, 'usePropertyAsUuid');
                    if (usePropertyAsUuid) {
                        n.watch(usePropertyAsUuid, function (uuid) {
                            if (uuid && typeof uuid == 'string' && uuid.length) {
                                n.setUuid(uuid);
                                self.refreshListArray(property);
                            }
                        });
                    }
                    if (self.__isAutosave) {
                        n.autosave();
                    }
                }
                toAddModels.push(n);
                // force conditions to be calculated initially
                if (!n.isInBackendMode()) {
                    Object.keys(n.__conditionActionIfMatchesAction).forEach(function (property) {
                        n.getProperty(property).subscribe(function (value) {
                            // skip
                        });
                    });
                    Object.keys(n.__conditionActionIfMatchesRemovedProperties).forEach(function (property) {
                        n.getProperty(property).subscribe(function (value) {
                            // skip
                        });
                    });
                }
            });
            toAddModels.forEach(function (d) {
                _this.getPropertyValue(property).push(d);
            });
            return this;
        }
        else {
            return this;
        }
    };
    /**
     * remove a new list entry
     * @param {?} property
     * @param {?=} uuidOrObject string or array set of string or PersistableModel or array set of PersistableModel
     * @return {?} this
     */
    PersistableModel.prototype.remove = /**
     * remove a new list entry
     * @param {?} property
     * @param {?=} uuidOrObject string or array set of string or PersistableModel or array set of PersistableModel
     * @return {?} this
     */
    function (property, uuidOrObject) {
        if (this.getMetadataValue(property, 'isList')) {
            var /** @type {?} */ toRemoveUuids = {};
            var /** @type {?} */ afterRemovedValue = [];
            if (typeof uuidOrObject === 'string') {
                toRemoveUuids[uuidOrObject] = true;
            }
            else {
                if (uuidOrObject instanceof PersistableModel) {
                    toRemoveUuids[uuidOrObject.getUuid()] = true;
                }
                else {
                    uuidOrObject.forEach(function (o) {
                        if (uuidOrObject instanceof PersistableModel) {
                            toRemoveUuids[o.getUuid()] = true;
                        }
                        else {
                            toRemoveUuids[o] = true;
                        }
                    });
                }
            }
            this.getPropertyValue(property).forEach(function (m) {
                if (toRemoveUuids[m.getUuid()] === undefined) {
                    afterRemovedValue.push(m);
                }
            });
            this.setProperty(property, afterRemovedValue);
        }
        return this;
    };
    /**
     * clear list entry
     * @param {?} property
     * @return {?} this
     */
    PersistableModel.prototype.clear = /**
     * clear list entry
     * @param {?} property
     * @return {?} this
     */
    function (property) {
        if (this.getMetadataValue(property, 'isList')) {
            this.transformTypeFromMetadata(property, []);
        }
        return this;
    };
    /**
     * return string representative from given property value
     * @param {?=} property
     * @return {?}
     */
    PersistableModel.prototype.__toString = /**
     * return string representative from given property value
     * @param {?=} property
     * @return {?}
     */
    function (property) {
        if (property === undefined) {
            return this.serialize();
        }
        var /** @type {?} */ s = null, /** @type {?} */ self = this;
        switch (this.getType(property)) {
            case 'text':
                s = self.getPropertyValue(property);
                break;
            case 'numberplain':
                s = self.getPropertyValue(property);
                break;
            default:
                if (typeof self.getPropertyValue(property) !== 'string') {
                    s = JSON.stringify(self.getPropertyValue(property));
                }
                else {
                    s = self.getPropertyValue(property);
                }
        }
        return s;
    };
    /**
     * set persistenceManager
     * @param {?} persistenceManager
     * @return {?}
     */
    PersistableModel.prototype.setPersistenceManager = /**
     * set persistenceManager
     * @param {?} persistenceManager
     * @return {?}
     */
    function (persistenceManager) {
        if (persistenceManager !== undefined) {
            this.__persistenceManager = persistenceManager;
        }
        if (this.__uuid.length == 0) {
            this.__uuid = angular2Uuid.UUID.UUID();
        }
        return this;
    };
    /**
     * valid this object
     * @param {?=} softcheck
     * @return {?}
     */
    PersistableModel.prototype.validate = /**
     * valid this object
     * @param {?=} softcheck
     * @return {?}
     */
    function (softcheck) {
        var /** @type {?} */ self = this;
        return new Promise(function (resolve, reject) {
            self.removeConditionProperties();
            classValidator.validate(self, { skipMissingProperties: true }).then(function (errors) {
                // errors is an array of validation errors
                if (errors.length > 0) {
                    if (softcheck) {
                        resolve();
                    }
                    else {
                        reject(errors);
                    }
                    self.__validationErrors = {};
                    errors.forEach(function (error) {
                        self.__validationErrors[error.property] = error;
                    });
                }
                else {
                    resolve();
                    self.__validationErrors = {};
                }
                Object.keys(self.__validatorObserver).forEach(function (property) {
                    if (self.__validationErrors[property] === undefined) {
                        self.__validatorObserver[property].next(false);
                    }
                    else {
                        self.__validatorObserver[property].next(self.__validationErrors[property]);
                    }
                });
            });
        });
    };
    /**
     * remove properties with invalid condition validators
     * @return {?}
     */
    PersistableModel.prototype.removeConditionProperties = /**
     * remove properties with invalid condition validators
     * @return {?}
     */
    function () {
        var /** @type {?} */ self = this;
        if (self.__conditionActionIfMatchesRemovedProperties) {
            Object.keys(self.__conditionActionIfMatchesRemovedProperties).forEach(function (property) {
                if (self.__conditionActionIfMatchesRemovedProperties[property]) {
                    if (self[property] !== undefined) {
                        self.__temp[property] = self[property];
                        delete self[property];
                    }
                }
            });
        }
        return this;
    };
    /**
     * get validation observable for given property
     * @param {?} property
     * @return {?}
     */
    PersistableModel.prototype.getValidation = /**
     * get validation observable for given property
     * @param {?} property
     * @return {?}
     */
    function (property) {
        var /** @type {?} */ self = this;
        if (self.__validator[property] === undefined) {
            self.__validator[property] = new rxjs.Observable(function (observer) {
                self.__validatorObserver[property] = observer;
            });
        }
        return self.__validator[property];
    };
    /**
     * get condition observable for given property
     * @param {?} property
     * @return {?}
     */
    PersistableModel.prototype.getCondition = /**
     * get condition observable for given property
     * @param {?} property
     * @return {?}
     */
    function (property) {
        var _this = this;
        if (this.__conditionActionIfMatches[property] == undefined) {
            if (Object.keys(this.__conditionActionIfMatches).length) {
                this.registerConditionValidators(true);
            }
            if (this.__conditionActionIfMatches[property] === undefined) {
                this.__conditionActionIfMatches[property] = new rxjs.Observable(function (observer) {
                    _this.__conditionActionIfMatchesObserver[property] = observer;
                });
            }
        }
        return this.__conditionActionIfMatches[property];
    };
    /**
     * is the object/property on editing state
     * @param {?=} property
     * @return {?}
     */
    PersistableModel.prototype.hasChanges = /**
     * is the object/property on editing state
     * @param {?=} property
     * @return {?}
     */
    function (property) {
        if (property) {
            return !(this.__edited[property] === undefined);
        }
        else {
            return (Object.keys(this.__edited).length);
        }
    };
    /**
     * remove changes state
     * @param {?=} property
     * @return {?}
     */
    PersistableModel.prototype.setHasNoChanges = /**
     * remove changes state
     * @param {?=} property
     * @return {?}
     */
    function (property) {
        if (property) {
            this.__forceUpdateProperty[property] = true;
            if (this.__edited[property]) {
                try {
                    delete this.__edited[property];
                }
                catch (/** @type {?} */ e) {
                    //
                }
            }
        }
        else {
            this.__edited = {};
        }
        return this;
    };
    /**
     * import dynamic properties
     * @param {?} propertiesAsObject
     * @return {?}
     */
    PersistableModel.prototype.importDynamicProperties = /**
     * import dynamic properties
     * @param {?} propertiesAsObject
     * @return {?}
     */
    function (propertiesAsObject) {
        var /** @type {?} */ self = this;
        return new Promise(function (resolve, reject) {
            Object.keys(propertiesAsObject).forEach(function (property) {
                self.transformTypeFromMetadata(property, propertiesAsObject[property]);
            });
            resolve(self);
        });
    };
    /**
     * load json data
     * @param {?} json
     * @return {?}
     */
    PersistableModel.prototype.loadJson = /**
     * load json data
     * @param {?} json
     * @return {?}
     */
    function (json) {
        var /** @type {?} */ self = this;
        json = typeof json == 'string' ? JSON.parse(json) : json;
        var /** @type {?} */ model = /** @type {?} */ (classTransformer.plainToClass(/** @type {?} */ (this.constructor), json, { excludePrefixes: ["__"] }));
        return new Promise(function (resolve, reject) {
            if (model) {
                var /** @type {?} */ propertiesWithValidationError_1 = {};
                model.validate().then(function (success) {
                }).catch(function (error) {
                    Object.keys(error).forEach(function (e) {
                        propertiesWithValidationError_1[e.property] = true;
                    });
                });
                // all properties without validation error
                Object.keys(json).forEach(function (property) {
                    if (property.substr(0, 2) !== '__' && propertiesWithValidationError_1[property] === undefined) {
                        if (Object.keys(self).indexOf(property) >= 0) {
                            self.transformTypeFromMetadata(property, model[property]);
                            if (model.isInBackendMode()) {
                                self[property] = model[property];
                                self.__edited[property] = self[property];
                            }
                        }
                    }
                });
                resolve(self);
            }
            else {
                resolve(self);
            }
        });
    };
    /**
     * transform type from metadata to avoid non matching data types
     * @param {?} property
     * @param {?} value
     * @return {?}
     */
    PersistableModel.prototype.transformTypeFromMetadata = /**
     * transform type from metadata to avoid non matching data types
     * @param {?} property
     * @param {?} value
     * @return {?}
     */
    function (property, value) {
        var /** @type {?} */ self = this;
        if (this.getMetadata(property, 'isTime').length) {
            return typeof value == 'string' ? new Date(value) : (value ? value : new Date());
        }
        if (this.getMetadata(property, 'isDate').length) {
            return value ? new Date(value) : (value ? value : new Date());
        }
        if (this.getMetadata(property, 'isCalendar').length) {
            return value ? new Date(value) : (value ? value : new Date());
        }
        if (this.getMetadata(property, 'isBirthDate').length) {
            return value ? new Date(value) : (value ? value : new Date());
        }
        if (this.getMetadata(property, 'isDateRange').length) {
            return typeof value == 'object' ? value : [];
        }
        if (this.getMetadata(property, 'isList').length) {
            var /** @type {?} */ valueAsObjects_1 = this.createListArray(property);
            if (value && typeof value.forEach !== 'function') {
                var /** @type {?} */ tmp = [];
                Object.keys(value).forEach(function (v) {
                    tmp.push(value[v]);
                });
                value = tmp;
            }
            if (value && value.length) {
                value.forEach(function (itemOriginal) {
                    if (itemOriginal !== undefined && itemOriginal && itemOriginal instanceof PersistableModel == false) {
                        var /** @type {?} */ uuid = itemOriginal[self.getMetadataValue(property, 'isList', null, 'usePropertyAsUuid')];
                        var /** @type {?} */ item_1 = null;
                        if (self.getAppsAppModuleProvider() !== undefined) {
                            item_1 = self.getAppsAppModuleProvider().new(self.getMetadataValue(property, 'isList'), uuid);
                        }
                        else {
                            // backend mode
                            var /** @type {?} */ constructor = self.getMetadataValue(property, 'isList');
                            item_1 = new constructor();
                            if (uuid !== undefined) {
                                item_1.setUuid(uuid);
                            }
                        }
                        if (item_1 !== undefined) {
                            item_1.loadJson(itemOriginal);
                            item_1.setParent(self);
                            if (!item_1.isInBackendMode()) {
                                item_1.loaded().then(function (m) {
                                    item_1.getChangesObserverable().subscribe(function (next) {
                                        if (next.model.getParent()) {
                                            next.model.getParent().setProperty(property, self.getPropertyValue(property, true));
                                        }
                                    });
                                });
                            }
                            valueAsObjects_1.push(item_1);
                        }
                    }
                    else {
                        valueAsObjects_1.push(itemOriginal);
                    }
                });
            }
            return valueAsObjects_1;
        }
        if (this.getMetadata(property, 'isSelect').length) {
            var /** @type {?} */ values = typeof value == 'object' ? value : [];
            var /** @type {?} */ realValues_1 = [];
            if (values && values.length) {
                values.forEach(function (val) {
                    realValues_1.push(self.getHashedValue(val));
                });
            }
            return realValues_1;
        }
        return value;
    };
    /**
     * Transform all properties
     * @return {?}
     */
    PersistableModel.prototype.transformAllProperties = /**
     * Transform all properties
     * @return {?}
     */
    function () {
        var /** @type {?} */ self = this;
        Object.keys(self).forEach(function (property) {
            if (property.substr(0, 1) !== '_') {
                self.transformTypeFromMetadata(property, self[property]);
            }
        });
        return this;
    };
    /**
     * has model pending changes that are not synchronised yet or not
     * @return {?}
     */
    PersistableModel.prototype.hasPendingChanges = /**
     * has model pending changes that are not synchronised yet or not
     * @return {?}
     */
    function () {
        return this._hasPendingChanges;
    };
    /**
     * set pending changes state
     * @param {?} state
     * @param {?=} action
     * @return {?}
     */
    PersistableModel.prototype.setHasPendingChanges = /**
     * set pending changes state
     * @param {?} state
     * @param {?=} action
     * @return {?}
     */
    function (state, action) {
        if (state && this.__persistenceManager) {
            this.__persistenceManager.addPendingChanges(this, action);
        }
        if (!state && this.__persistenceManager) {
            this.__persistenceManager.removePendingChanges(this);
        }
        this._hasPendingChanges = state;
        return this;
    };
    /**
     * serialize this object
     * @param {?=} noUnderScoreData
     * @param {?=} asObject
     * @return {?}
     */
    PersistableModel.prototype.serialize = /**
     * serialize this object
     * @param {?=} noUnderScoreData
     * @param {?=} asObject
     * @return {?}
     */
    function (noUnderScoreData, asObject) {
        var /** @type {?} */ json = '';
        if (noUnderScoreData || noUnderScoreData === undefined) {
            json = classTransformer.serialize(this, { excludePrefixes: ["__", "_"] });
        }
        else {
            json = classTransformer.serialize(this, { excludePrefixes: ["__"] });
        }
        if (asObject) {
            return JSON.parse(json);
        }
        else {
            return json;
        }
    };
    /**
     * get the persistence manger
     * @return {?}
     */
    PersistableModel.prototype.getPersistenceManager = /**
     * get the persistence manger
     * @return {?}
     */
    function () {
        return this.__persistenceManager;
    };
    /**
     * check if current network state is online
     * @return {?}
     */
    PersistableModel.prototype.isOnline = /**
     * check if current network state is online
     * @return {?}
     */
    function () {
        return this.__isOnline;
    };
    /**
     * set if model is connected to internet
     * @param {?} state
     * @return {?}
     */
    PersistableModel.prototype.setIsOnline = /**
     * set if model is connected to internet
     * @param {?} state
     * @return {?}
     */
    function (state) {
        this.__isOnline = state;
        return this;
    };
    /**
     * get properties metatadata
     * @param {?=} property
     * @param {?=} type
     * @return {?}
     */
    PersistableModel.prototype.getMetadata = /**
     * get properties metatadata
     * @param {?=} property
     * @param {?=} type
     * @return {?}
     */
    function (property, type) {
        if (this.__metadataCache[property + '__' + (type === undefined ? '' : type)] === undefined) {
            var /** @type {?} */ validationMetadata_1 = [];
            this.__metadata.forEach(function (metadata) {
                if (!property || metadata.propertyName == property) {
                    if (!type || metadata.type == type || (metadata.type == 'customValidation' && metadata.constraints && metadata.constraints[0].type == type)) {
                        validationMetadata_1.push(metadata);
                    }
                }
            });
            this.__metadataCache[property + '__' + (type === undefined ? '' : type)] = validationMetadata_1;
        }
        return this.__metadataCache[property + '__' + (type === undefined ? '' : type)];
    };
    /**
     * check if property is type of array
     * @param {?} property
     * @return {?}
     */
    PersistableModel.prototype.isArray = /**
     * check if property is type of array
     * @param {?} property
     * @return {?}
     */
    function (property) {
        return typeof this[property] == 'object' ? (this[property] !== null && typeof this[property].length == 'number' ? true : false) : false;
    };
    /**
     * get metadata contraints value
     * @param {?=} property
     * @param {?=} type
     * @param {?=} metadataInput
     * @param {?=} constraints
     * @return {?}
     */
    PersistableModel.prototype.getMetadataValue = /**
     * get metadata contraints value
     * @param {?=} property
     * @param {?=} type
     * @param {?=} metadataInput
     * @param {?=} constraints
     * @return {?}
     */
    function (property, type, metadataInput, constraints) {
        var /** @type {?} */ metadata = null;
        if (metadataInput == undefined) {
            metadata = this.getMetadata(property, type)[0];
        }
        else {
            if (metadataInput.length) {
                metadataInput.forEach(function (m) {
                    if (m.constraints && m.constraints[0].type == type) {
                        metadata = m;
                    }
                });
            }
        }
        if (constraints == undefined) {
            constraints = 'value';
        }
        if (metadata && metadata.constraints) {
            if (metadata.constraints.length == 1) {
                if (metadata.constraints[0].type && Object.keys(metadata.constraints[0]).indexOf(constraints)) {
                    return metadata.constraints[0][constraints] == undefined ? true : metadata.constraints[0][constraints];
                }
                return metadata.constraints[0];
            }
            else {
                return metadata.constraints;
            }
        }
        if (metadata && metadata.validationTypeOptions) {
            if (metadata.validationTypeOptions.length == 1) {
                return metadata.validationTypeOptions[0];
            }
            else {
                return metadata.validationTypeOptions;
            }
        }
        return null;
    };
    /**
     * resolves input type for given property
     * @param {?} property
     * @return {?}
     */
    PersistableModel.prototype.getType = /**
     * resolves input type for given property
     * @param {?} property
     * @return {?}
     */
    function (property) {
        var /** @type {?} */ type = null;
        var /** @type {?} */ typeMappings = {
            'isString': 'text',
            'isList': 'list',
            'number': 'numberplain',
            'isPrecision': 'numberplain',
            'isNumber': 'number',
            'isInt': this.getMetadata(property, 'max').length && this.getMetadataValue(property, 'max') <= 50 ? 'integer' : 'numberplain',
            'isPhoneNumber': 'tel',
            'isPassword': 'password',
            'isEmail': 'email',
            'isUrl': 'url',
            'isText': 'textarea',
            'isDate': 'date',
            'isDates': 'dates',
            'isBoolean': 'boolean',
            'isRating': 'rating',
            'isBirthDate': 'birthday',
            'isSelect': 'select',
            'isDateRange': 'dates',
            'isCalendar': 'date',
            'isTime': 'time',
            'isHidden': null,
            'isNumpad': 'number',
            'customValidation': function (metadata) {
                if (metadata.constraints[0].type && metadata.constraints[0].type && metadata.constraints[0].type.substr(0, 3) !== 'has') {
                    return typeMappings[metadata.constraints[0].type] !== undefined ? typeMappings[metadata.constraints[0].type] : metadata.constraints[0].type;
                }
                return null;
            }
        };
        this.getMetadata(property).forEach(function (metadata) {
            if (type == null && typeMappings[metadata.type] !== undefined && typeMappings[metadata.type] !== null) {
                if (typeof typeMappings[metadata.type] == 'string') {
                    type = typeMappings[metadata.type];
                }
                else if (typeof typeMappings[metadata.type] == 'function') {
                    type = typeMappings[metadata.type](metadata);
                }
            }
        });
        if (!type) {
            type = typeMappings[typeof this[property]] !== undefined && typeMappings[typeof this[property]] !== null ? typeMappings[typeof this[property]] : null;
        }
        return type ? type : 'text';
    };
    /**
     * registers condition validators
     * @param {?} prepare
     * @return {?}
     */
    PersistableModel.prototype.registerConditionValidators = /**
     * registers condition validators
     * @param {?} prepare
     * @return {?}
     */
    function (prepare) {
        var /** @type {?} */ self = this;
        self.__conditionBindings = { 'request': {}, 'properties': {} };
        var /** @type {?} */ registerCondition = function (validator, customProperty) {
            var /** @type {?} */ hasRealtimeTypes = false;
            var /** @type {?} */ customPropertyName = customProperty == undefined ? validator.propertyName : customProperty;
            if (customPropertyName == validator.propertyName) {
                self.__conditionActionIfMatchesRemovedProperties[validator.propertyName] = true;
            }
            if (self.__conditionActionIfMatches[customPropertyName] == undefined) {
                self.__conditionActionIfMatches[customPropertyName] = new rxjs.Observable(function (observer) {
                    self.__conditionActionIfMatchesObserver[customPropertyName] = observer;
                    self.__conditionActionIfMatchesObserver[customPropertyName].next({
                        'action': self.__conditionActionIfMatchesAction[customPropertyName],
                        'state': true
                    });
                });
                // self.__conditionActionIfMatches[validator.propertyName].subscribe(() => {
                // });
                // self.__conditionActionIfMatches[validator.propertyName].share();
                //
            }
            if (!prepare) {
                if (self.__conditionActionIfMatchesObserver && self.__conditionActionIfMatchesAction[customPropertyName] === undefined && self.__conditionActionIfMatchesObserver[customPropertyName]) {
                    self.__conditionActionIfMatchesAction[customPropertyName] = validator.constraints[0].actionIfMatches;
                    self.__conditionActionIfMatchesObserver[customPropertyName].next({
                        'action': self.__conditionActionIfMatchesAction[customPropertyName],
                        'state': true
                    });
                }
                validator.constraints[0].value.forEach(function (v) {
                    if (v.type == 'limit') {
                        hasRealtimeTypes = true;
                    }
                    if (self.__conditionContraintsProperties[customPropertyName] === undefined) {
                        self.__conditionContraintsProperties[customPropertyName] = {};
                    }
                    self.__conditionContraintsProperties[customPropertyName][v.type] = true;
                    if (self.__conditionContraintsAffectedProperties[v.property] === undefined) {
                        self.__conditionContraintsAffectedProperties[v.property] = {};
                    }
                    self.__conditionContraintsAffectedProperties[v.property][customPropertyName] = true;
                });
                if (hasRealtimeTypes) {
                    self.__conditionBindings['request'][validator.propertyName] = self.getFirebaseDatabase().object(self.getFirebaseDatabasePath() + "/condition/request/" + validator.propertyName);
                    self.__conditionBindings['request'][validator.propertyName].set(validator.constraints[0].value);
                }
            }
        };
        this.getMetadata(null, 'hasConditions').forEach(function (validator) {
            registerCondition(validator);
        });
        this.getMetadata(null, 'isHidden').forEach(function (validator) {
            if (validator.constraints.length && validator.constraints[0].value !== undefined) {
                registerCondition(validator, '__isHidden__' + validator.propertyName);
            }
        });
        if (!prepare) {
            Object.keys(self.__conditionContraintsProperties).forEach(function (property) {
                if (self.__conditionContraintsProperties[property]['limit'] !== undefined) {
                    self.__conditionBindings['properties'][property] = self.getFirebaseDatabase().object(self.getFirebaseDatabasePath() + "/condition/properties/" + property);
                }
            });
        }
        return this;
    };
    /**
     * @param {?} property
     * @param {?} chain
     * @param {?} counter
     * @return {?}
     */
    PersistableModel.prototype.calculateCircularCondition = /**
     * @param {?} property
     * @param {?} chain
     * @param {?} counter
     * @return {?}
     */
    function (property, chain, counter) {
        var /** @type {?} */ self = this;
        if (self.__conditionContraintsAffectedProperties[property] !== undefined) {
            Object.keys(self.__conditionContraintsAffectedProperties[property]).forEach(function (key) {
                if (key == property) {
                    return chain;
                }
                if (self.__conditionContraintsAffectedProperties[key] !== undefined) {
                    chain[key] = counter;
                    counter++;
                    self.calculateCircularCondition(key, chain, counter);
                    Object.keys(self.__conditionContraintsAffectedProperties[key]).forEach(function (k) {
                        chain[k] = counter;
                    });
                }
            });
        }
        return chain;
    };
    /**
     *
     * @param {?} property
     * @return {?}
     */
    PersistableModel.prototype.executeConditionValidatorCircular = /**
     *
     * @param {?} property
     * @return {?}
     */
    function (property) {
        var /** @type {?} */ self = this;
        var /** @type {?} */ circularChain = {}, /** @type {?} */ counter = 0;
        var /** @type {?} */ obj = self.calculateCircularCondition(property, circularChain, counter);
        var /** @type {?} */ keys = Object.keys(obj);
        keys.sort(function (a, b) {
            return obj[a] - obj[b];
        });
        self.executeConditionValidator(property);
        keys.forEach(function (key) {
            self.executeConditionValidator(key);
        });
        return this;
    };
    /**
     *
     * @param {?} property
     * @return {?}
     */
    PersistableModel.prototype.executeConditionValidator = /**
     *
     * @param {?} property
     * @return {?}
     */
    function (property) {
        var /** @type {?} */ self = this;
        if (self.__conditionContraintsProperties[property] !== undefined) {
            if (self.__conditionBindings['properties'][property] !== undefined) {
                self.__conditionBindings['properties'][property].set(self.__conditionContraintsPropertiesValue[property]);
            }
        }
        var /** @type {?} */ result = classValidator.validateSync(self, { groups: ["condition_" + property] });
        if (result.length) {
            self.__conditionContraintsPropertiesValue[property] = null;
        }
        else {
            self.__conditionContraintsPropertiesValue[property] = self.getPropertyValue(property, true);
        }
        if (self.__conditionActionIfMatchesObserver[property] !== undefined) {
            self.__conditionActionIfMatchesObserver[property].next({
                action: self.__conditionActionIfMatchesAction[property],
                state: result.length ? true : false
            });
        }
        self.recoverMissingProperty(property);
        self.__conditionActionIfMatchesRemovedProperties[property] = result.length ? true : false;
        if (self.__validatorObserver[property]) {
            self.__validatorObserver[property].next(result.length ? true : false);
        }
        if (this.__conditionContraintsAffectedProperties[property] !== undefined) {
            Object.keys(this.__conditionContraintsAffectedProperties[property]).forEach(function (affectedProperty) {
                var /** @type {?} */ result = [];
                if (affectedProperty.substr(0, 12) == '__isHidden__') {
                    result = classValidator.validateSync(self, { groups: [affectedProperty] });
                }
                else {
                    result = classValidator.validateSync(self, { groups: ["condition_" + affectedProperty] });
                }
                if (self.__conditionActionIfMatchesObserver[affectedProperty] !== undefined) {
                    self.__conditionActionIfMatchesObserver[affectedProperty].next({
                        action: self.__conditionActionIfMatchesAction[affectedProperty],
                        state: result.length ? true : false
                    });
                }
                self.recoverMissingProperty(affectedProperty);
                self.__conditionActionIfMatchesRemovedProperties[affectedProperty] = result.length ? true : false;
                if (self.__validatorObserver[affectedProperty] !== undefined) {
                    self.__validatorObserver[affectedProperty].next(result.length ? true : false);
                }
            });
        }
        return this;
    };
    /**
     * recovers a missing property
     * @param {?} property
     * @return {?}
     */
    PersistableModel.prototype.recoverMissingProperty = /**
     * recovers a missing property
     * @param {?} property
     * @return {?}
     */
    function (property) {
        if (Object.keys(this).indexOf(property) == -1) {
            if (this.__temp[property] == undefined) {
                var /** @type {?} */ tmpmodel = /** @type {?} */ (classTransformer.plainToClass(/** @type {?} */ (this.constructor), {}, { excludePrefixes: ["__"] }));
                this[property] = tmpmodel[property];
            }
            else {
                this[property] = this.__temp[property];
            }
        }
        return this;
    };
    /**
     * set notificationProvider
     * @param {?} notificationProvider
     * @return {?}
     */
    PersistableModel.prototype.setNotificationProvider = /**
     * set notificationProvider
     * @param {?} notificationProvider
     * @return {?}
     */
    function (notificationProvider) {
        this.__notificationProvider = notificationProvider;
        return this;
    };
    /**
     *
     * @param {?} promise
     * @return {?}
     */
    PersistableModel.prototype.setIsLoadedPromise = /**
     *
     * @param {?} promise
     * @return {?}
     */
    function (promise) {
        var /** @type {?} */ self = this;
        this.__isLoadedPromise = promise;
        this.__isLoadedPromise.then(function () {
            self.__isLoaded = true;
        });
        return this;
    };
    /**
     * Is loaded promise
     * @return {?}
     */
    PersistableModel.prototype.loaded = /**
     * Is loaded promise
     * @return {?}
     */
    function () {
        var /** @type {?} */ self = this;
        if (this.__isLoadedPromise == undefined) {
            return new Promise(function (resolve, reject) {
                resolve(self);
            });
        }
        else {
            return this.__isLoadedPromise;
        }
    };
    /**
     * send notification message to user
     * @param {?} message
     * @param {?=} error
     * @return {?}
     */
    PersistableModel.prototype.notify = /**
     * send notification message to user
     * @param {?} message
     * @param {?=} error
     * @return {?}
     */
    function (message, error) {
        if (this.__notificationProvider !== undefined && this.__notificationProvider) {
            this.__notificationProvider(message, error);
        }
        return this;
    };
    /**
     * Get hased values
     * \@Returns object
     * @return {?}
     */
    PersistableModel.prototype.getHashedValues = /**
     * Get hased values
     * \@Returns object
     * @return {?}
     */
    function () {
        var /** @type {?} */ values = [];
        var /** @type {?} */ self = this;
        Object.keys(this.__hashedValues).forEach(function (hash) {
            values.push({ value: self.__hashedValues[hash], hash: hash });
        });
        return values;
    };
    /**
     * Set hased values
     * \@Returns mixed
     * @param {?} value
     * @param {?} hash
     * @return {?}
     */
    PersistableModel.prototype.addHashedValue = /**
     * Set hased values
     * \@Returns mixed
     * @param {?} value
     * @param {?} hash
     * @return {?}
     */
    function (value, hash) {
        this.__hashedValues[hash] = value;
        return this;
    };
    /**
     * Get value from hashed value
     * \@Returns mixed
     * @param {?} hash
     * @return {?}
     */
    PersistableModel.prototype.getHashedValue = /**
     * Get value from hashed value
     * \@Returns mixed
     * @param {?} hash
     * @return {?}
     */
    function (hash) {
        return this.__hashedValues[hash] !== undefined ? this.__hashedValues[hash] : hash;
    };
    /**
     * Set hashed value
     * \@Returns string hash
     * @param {?} value
     * @return {?}
     */
    PersistableModel.prototype.setHashedValue = /**
     * Set hashed value
     * \@Returns string hash
     * @param {?} value
     * @return {?}
     */
    function (value) {
        var /** @type {?} */ hash = typeof value == 'object' ? objectHash.sha1(value) : value;
        this.__hashedValues[hash] = value;
        return hash;
    };
    /**
     * set appsAppModuleProvider
     * @param {?} appsAppModuleProvider
     * @return {?}
     */
    PersistableModel.prototype.setAppsAppModuleProvider = /**
     * set appsAppModuleProvider
     * @param {?} appsAppModuleProvider
     * @return {?}
     */
    function (appsAppModuleProvider) {
        this.__appsAppModuleProvider = appsAppModuleProvider;
        return this;
    };
    /**
     * set appsAppModuleProvider
     * @return {?}
     */
    PersistableModel.prototype.getAppsAppModuleProvider = /**
     * set appsAppModuleProvider
     * @return {?}
     */
    function () {
        return this.__appsAppModuleProvider;
    };
    /**
     * set parent model
     * @param {?} parentModel
     * @return {?}
     */
    PersistableModel.prototype.setParent = /**
     * set parent model
     * @param {?} parentModel
     * @return {?}
     */
    function (parentModel) {
        this.__parent = parentModel;
        return this;
    };
    /**
     * get parent model
     * @return {?}
     */
    PersistableModel.prototype.getParent = /**
     * get parent model
     * @return {?}
     */
    function () {
        return this.__parent;
    };
    /**
     * get changes observerable
     * @return {?}
     */
    PersistableModel.prototype.getChangesObserverable = /**
     * get changes observerable
     * @return {?}
     */
    function () {
        return this.__editedObservable;
    };
    /**
     * execute changes with callback
     * @param {?} event
     * @return {?}
     */
    PersistableModel.prototype.executeChangesWithCallback = /**
     * execute changes with callback
     * @param {?} event
     * @return {?}
     */
    function (event) {
        this.__editedObservableCallbacks.forEach(function (callback) {
            callback(event);
        });
        return this;
    };
    /**
     * observe property
     * @param {?} property
     * @param {?} callback
     * @return {?}
     */
    PersistableModel.prototype.watch = /**
     * observe property
     * @param {?} property
     * @param {?} callback
     * @return {?}
     */
    function (property, callback) {
        this.__editedObservableObservers.push({ callback: callback, property: property });
        callback(this.getPropertyValue(property));
        this.loaded().then(function (model) {
            callback(model.getPropertyValue(property));
        });
        return this;
    };
    /**
     * get changes with callback
     * @param {?} callback
     * @return {?}
     */
    PersistableModel.prototype.getChangesWithCallback = /**
     * get changes with callback
     * @param {?} callback
     * @return {?}
     */
    function (callback) {
        this.__editedObservableCallbacks.push(callback);
        return this;
    };
    /**
     * Check if model is initialized in backend mode
     * @return {?}
     */
    PersistableModel.prototype.isInBackendMode = /**
     * Check if model is initialized in backend mode
     * @return {?}
     */
    function () {
        return global[this.constructor.name] === undefined ? false : true;
    };
    /**
     * Enable autosave mode
     * @return {?}
     */
    PersistableModel.prototype.autosave = /**
     * Enable autosave mode
     * @return {?}
     */
    function () {
        this.__isAutosave = true;
        return this;
    };
    /**
     * check if model has errors or not
     * @return {?}
     */
    PersistableModel.prototype.isValid = /**
     * check if model has errors or not
     * @return {?}
     */
    function () {
        return Object.keys(this.__validationErrors).length ? false : true;
    };
    /**
     * create list array
     * @param {?} property
     * @return {?}
     */
    PersistableModel.prototype.createListArray = /**
     * create list array
     * @param {?} property
     * @return {?}
     */
    function (property) {
        var /** @type {?} */ self = this;
        if (!self.isInBackendMode() && this.__listArrays[property] === undefined) {
            this.__listArrays[property] = new Array();
            self.watch(property, function (value) {
                self.refreshListArray(property, value);
            });
        }
        else {
            if (this.__listArrays[property] === undefined) {
                this.__listArrays[property] = new Array();
            }
        }
        return this.__listArrays[property];
    };
    /**
     * refresh list array
     * @param {?} property
     * @param {?=} value
     * @return {?}
     */
    PersistableModel.prototype.refreshListArray = /**
     * refresh list array
     * @param {?} property
     * @param {?=} value
     * @return {?}
     */
    function (property, value) {
        var /** @type {?} */ properties = {}, /** @type {?} */ v = value == undefined ? this.getPropertyValue(property) : value;
        if (v && v.length) {
            v.forEach(function (item) {
                if (item && item instanceof PersistableModel && typeof item.getUuid == 'function') {
                    properties[item.getUuid()] = {
                        value: item,
                        enumerable: false,
                        configurable: true
                    };
                }
            });
        }
        Object.defineProperties(this.__listArrays[property], properties);
        return this;
    };
    return PersistableModel;
}());

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @param {?=} validationOptions
 * @return {?}
 */
function HasBadge(validationOptions) {
    return function (object, propertyName) {
        classValidator.registerDecorator({
            name: "hasBadge",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'hasBadge' }],
            options: validationOptions,
            validator: {
                validate: /**
                 * @param {?} value
                 * @param {?} args
                 * @return {?}
                 */
                function (value, args) {
                    return true;
                }
            }
        });
    };
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @param {?=} validationOptions
 * @return {?}
 */
function HasIcon(validationOptions) {
    return function (object, propertyName) {
        classValidator.registerDecorator({
            name: "hasIcon",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'hasIcon' }],
            options: validationOptions,
            validator: {
                validate: /**
                 * @param {?} value
                 * @param {?} args
                 * @return {?}
                 */
                function (value, args) {
                    return true;
                }
            }
        });
    };
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @param {?=} validationOptions
 * @return {?}
 */
function HasName(validationOptions) {
    return function (object, propertyName) {
        classValidator.registerDecorator({
            name: "hasName",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'hasName' }],
            options: validationOptions,
            validator: {
                validate: /**
                 * @param {?} value
                 * @param {?} args
                 * @return {?}
                 */
                function (value, args) {
                    return true;
                }
            }
        });
    };
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @param {?} options
 * @param {?=} actionIfMatches
 * @param {?=} validationOptions
 * @return {?}
 */
function HasConditions(options, actionIfMatches, validationOptions) {
    return function (object, propertyName) {
        if (actionIfMatches == undefined) {
            actionIfMatches = 'show';
        }
        options.forEach(function (option) {
            if (option.additionalData == undefined) {
                option.additionalData = {};
            }
            if (option.property == undefined) {
                option.property = propertyName;
            }
            if (option.validator == undefined) {
                option.validator = 'equals';
            }
            if (option.type == undefined) {
                option.type = 'condition';
            }
            if (option.value == undefined) {
                option.value = true;
            }
            // rewrite nested properties
            if (option.property.indexOf('.') > 0) {
                option.additionalData.propertyNestedAsNestedObject = option.property;
                option.property = option.property.substr(0, option.property.indexOf('.'));
            }
        });
        var /** @type {?} */ getNestedValue = function (property, value) {
            if (property.indexOf(".") > 0) {
                return value == undefined ? value : getNestedValue(property.substr(property.indexOf('.') + 1), value[property.substr(0, property.indexOf("."))]);
            }
            else {
                return value == undefined || value[property] == undefined ? undefined : value[property];
            }
        };
        classValidator.registerDecorator({
            name: "hasConditions",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'hasConditions', 'value': options, 'actionIfMatches': actionIfMatches }],
            options: { groups: ['condition_' + propertyName] },
            validator: {
                validate: /**
                 * @param {?} value
                 * @param {?} args
                 * @return {?}
                 */
                function (value, args) {
                    var /** @type {?} */ validator = new classValidator.Validator();
                    var /** @type {?} */ state = true;
                    var /** @type {?} */ valueNested = null;
                    /**
                                         * iterates over all rules synchronous
                                         */
                    if (options) {
                        options.forEach(function (condition) {
                            if (condition.additionalData.propertyNestedAsNestedObject !== undefined) {
                                valueNested = JSON.parse(JSON.stringify(args.object.__conditionContraintsPropertiesValue[condition.property]));
                                if (typeof valueNested == 'object' && valueNested.forEach !== undefined) {
                                    valueNested.forEach(function (v, i) {
                                        if (typeof v == 'string' && args.object.getHashedValue(v) !== v) {
                                            valueNested[i] = args.object.getHashedValue(v);
                                        }
                                        valueNested[i] = getNestedValue(condition.additionalData.propertyNestedAsNestedObject.substr(condition.additionalData.propertyNestedAsNestedObject.indexOf(".") + 1), valueNested[i]);
                                    });
                                }
                                if (typeof valueNested == 'string') {
                                    if (args.object.getHashedValue(valueNested) !== valueNested) {
                                        valueNested = args.object.getHashedValue(valueNested);
                                    }
                                    valueNested = getNestedValue(condition.additionalData.propertyNestedAsNestedObject.substr(condition.additionalData.propertyNestedAsNestedObject.indexOf(".") + 1), valueNested);
                                }
                                if (valueNested === null && condition.validator.indexOf('array') >= 0) {
                                    valueNested = [];
                                }
                            }
                            if (state) {
                                if (condition.type == 'condition') {
                                    if (valueNested === null && condition.validator == 'equals' && value !== undefined && value !== null && value.length !== undefined && value.length == 0) {
                                        state = true;
                                    }
                                    else {
                                        if (!validator[condition.validator](valueNested ? valueNested : (args.object.__conditionContraintsPropertiesValue[condition.property] === undefined ? args.object[condition.property] : args.object.__conditionContraintsPropertiesValue[condition.property]), condition.value, condition.validatorAdditionalArgument)) {
                                            state = false;
                                        }
                                    }
                                }
                            }
                        });
                    }
                    /**
                                         *  if is in backend service mode, so override property value and condition validator state
                                         */
                    if (!state && args.object.isInBackendMode()) {
                        try {
                            delete args.object[args.property];
                        }
                        catch (/** @type {?} */ e) {
                            return false;
                        }
                        return true;
                    }
                    return state;
                }
            }
        });
    };
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @param {?} description
 * @param {?=} validationOptions
 * @return {?}
 */
function HasDescription(description, validationOptions) {
    return function (object, propertyName) {
        classValidator.registerDecorator({
            name: "hasDescription",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'hasDescription', 'value': description }],
            options: validationOptions,
            validator: {
                validate: /**
                 * @param {?} value
                 * @param {?} args
                 * @return {?}
                 */
                function (value, args) {
                    return true;
                }
            }
        });
    };
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @param {?} label
 * @param {?=} validationOptions
 * @return {?}
 */
function HasLabel(label, validationOptions) {
    return function (object, propertyName) {
        classValidator.registerDecorator({
            name: "hasLabel",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'hasLabel', 'value': label }],
            options: validationOptions,
            validator: {
                validate: /**
                 * @param {?} value
                 * @param {?} args
                 * @return {?}
                 */
                function (value, args) {
                    return true;
                }
            }
        });
    };
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @param {?} label
 * @param {?=} validationOptions
 * @return {?}
 */
function HasPlaceholder(label, validationOptions) {
    return function (object, propertyName) {
        classValidator.registerDecorator({
            name: "hasPlaceholder",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'hasPlaceholder', 'value': label }],
            options: validationOptions,
            validator: {
                validate: /**
                 * @param {?} value
                 * @param {?} args
                 * @return {?}
                 */
                function (value, args) {
                    return true;
                }
            }
        });
    };
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @param {?} precision
 * @param {?=} validationOptions
 * @return {?}
 */
function HasPrecision(precision, validationOptions) {
    return function (object, propertyName) {
        classValidator.registerDecorator({
            name: "hasPrecision",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'hasPrecision', 'value': precision }],
            options: validationOptions,
            validator: {
                validate: /**
                 * @param {?} value
                 * @param {?} args
                 * @return {?}
                 */
                function (value, args) {
                    return true;
                }
            }
        });
    };
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @param {?=} validationOptions
 * @return {?}
 */
function IsBirthDate(validationOptions) {
    return function (object, propertyName) {
        classValidator.registerDecorator({
            name: "IsBirthDate",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'isBirthDate', 'value': true }],
            options: validationOptions,
            validator: {
                validate: /**
                 * @param {?} value
                 * @param {?} args
                 * @return {?}
                 */
                function (value, args) {
                    return true;
                }
            }
        });
    };
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @param {?=} options
 * @return {?}
 */
function IsCalendar(options) {
    return function (object, propertyName) {
        classValidator.registerDecorator({
            name: "isCalendar",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'isCalendar', value: options }],
            validator: {
                validate: /**
                 * @param {?} value
                 * @param {?} args
                 * @return {?}
                 */
                function (value, args) {
                    return true;
                }
            }
        });
    };
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @param {?=} options
 * @return {?}
 */
function IsDateRange(options) {
    return function (object, propertyName) {
        classValidator.registerDecorator({
            name: "isDateRange",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'isDateRange', value: options }],
            validator: {
                validate: /**
                 * @param {?} value
                 * @param {?} args
                 * @return {?}
                 */
                function (value, args) {
                    return true;
                }
            }
        });
    };
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @return {?}
 */
function IsPassword() {
    return function (object, propertyName) {
        classValidator.registerDecorator({
            name: "isPassword",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'isPassword' }],
            validator: {
                validate: /**
                 * @param {?} value
                 * @return {?}
                 */
                function (value) {
                    return true;
                }
            }
        });
    };
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @param {?=} property
 * @param {?=} validationOptions
 * @return {?}
 */
function IsPhoneNumber(property, validationOptions) {
    return function (object, propertyName) {
        classValidator.registerDecorator({
            name: "isPhoneNumber",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'isPhoneNumber', 'value': property }],
            options: validationOptions,
            validator: {
                validate: /**
                 * @param {?} value
                 * @param {?} args
                 * @return {?}
                 */
                function (value, args) {
                    var /** @type {?} */ r = /[\\+ 0-9]/;
                    return r.test(value);
                }
            }
        });
    };
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @param {?=} options
 * @param {?=} validationOptions
 * @return {?}
 */
function IsRating(options, validationOptions) {
    return function (object, propertyName) {
        classValidator.registerDecorator({
            name: "isRating",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'isRating', 'value': options }],
            options: validationOptions,
            validator: {
                validate: /**
                 * @param {?} value
                 * @param {?} args
                 * @return {?}
                 */
                function (value, args) {
                    return true;
                }
            }
        });
    };
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @param {?=} length
 * @param {?=} validationOptions
 * @return {?}
 */
function IsText(length, validationOptions) {
    return function (object, propertyName) {
        classValidator.registerDecorator({
            name: "isText",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'isText', 'value': length }],
            options: validationOptions,
            validator: {
                validate: /**
                 * @param {?} value
                 * @param {?} args
                 * @return {?}
                 */
                function (value, args) {
                    return (!length || value.length < length ? true : false);
                }
            }
        });
    };
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @param {?=} options
 * @param {?=} validationOptions
 * @return {?}
 */
function IsNumpad(options, validationOptions) {
    return function (object, propertyName) {
        classValidator.registerDecorator({
            name: "isNumpad",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'isNumpad', 'value': options }],
            options: validationOptions,
            validator: {
                validate: /**
                 * @param {?} value
                 * @param {?} args
                 * @return {?}
                 */
                function (value, args) {
                    return true;
                }
            }
        });
    };
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @param {?=} options
 * @return {?}
 */
function IsSelect(options) {
    return function (object, propertyName) {
        classValidator.registerDecorator({
            name: "isSelect",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'isSelect', value: options }],
            validator: {
                validate: /**
                 * @param {?} value
                 * @param {?} args
                 * @return {?}
                 */
                function (value, args) {
                    return new Promise(function (resolve, reject) {
                        var /** @type {?} */ optionValidator = {
                            target: value,
                            source: args.constraints[0].value.source,
                            getOptions: function () {
                                return new Promise(function (resolveOptions, rejectOptions) {
                                    if (optionValidator.source) {
                                        if (optionValidator.source.url.substr(0, 4) == 'http') {
                                            Unirest.get(optionValidator.source.url).type('json').end(function (response) {
                                                var /** @type {?} */ options = [];
                                                if (response.error) {
                                                    rejectOptions(response.error);
                                                }
                                                else {
                                                    response.body.forEach(function (item) {
                                                        options.push({
                                                            value: optionValidator.source.mapping.value !== null && optionValidator.source.mapping.value !== undefined ? optionValidator._getPropertyFromObject(item, optionValidator.source.mapping.value) : item,
                                                            text: optionValidator._getPropertyFromObject(item, optionValidator.source.mapping.text),
                                                            disabled: optionValidator.source.mapping.disabled !== undefined ? optionValidator._getPropertyFromObject(item, optionValidator.source.mapping.disabled) : false,
                                                        });
                                                    });
                                                    resolveOptions(options);
                                                }
                                            });
                                        }
                                        else {
                                            resolveOptions([]);
                                        }
                                    }
                                    else {
                                        resolveOptions(args.constraints[0].value.options);
                                    }
                                });
                            },
                            _getPropertyFromObject: function (inputObject, property) {
                                if (typeof property == 'function') {
                                    return inputObject !== undefined ? property(inputObject) : null;
                                }
                                if (property.indexOf(".") > 0) {
                                    return optionValidator._getPropertyFromObject(inputObject[property.substr(0, property.indexOf("."))], property.substr(property.indexOf(".") + 1));
                                }
                                else {
                                    return inputObject[property];
                                }
                            }
                        };
                        optionValidator.getOptions().then(function (options) {
                            if (options.length == 0) {
                                resolve(true);
                            }
                            var /** @type {?} */ allValide = true;
                            var /** @type {?} */ values = {};
                            options.forEach(function (option) {
                                if (!option.disabled) {
                                    values[typeof option.value == 'object' ? objectHash.sha1(option.value) : option.value] = true;
                                }
                            });
                            if (typeof optionValidator.target.forEach == 'function') {
                                optionValidator.target.forEach(function (value) {
                                    if (values[typeof value == 'object' ? objectHash.sha1(value) : value] == undefined) {
                                        allValide = false;
                                    }
                                });
                            }
                            if (allValide) {
                                resolve(true);
                            }
                            else {
                                resolve(false);
                            }
                        }).catch(function (error) {
                            console.log(error);
                            resolve(false);
                        });
                    });
                }
            }
        });
    };
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @param {?} typeOfItems
 * @param {?=} usePropertyAsUuid
 * @param {?=} uniqueItems
 * @return {?}
 */
function IsList(typeOfItems, usePropertyAsUuid, uniqueItems) {
    return function (object, propertyName) {
        classValidator.registerDecorator({
            name: "isList",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'isList', 'value': typeOfItems, 'usePropertyAsUuid': usePropertyAsUuid, 'uniqueItems': uniqueItems == undefined ? false : uniqueItems }],
            validator: {
                validate: /**
                 * @param {?} value
                 * @param {?} args
                 * @return {?}
                 */
                function (value, args) {
                    return new Promise(function (resolve, reject) {
                        var /** @type {?} */ requiredValidations = value.length;
                        var /** @type {?} */ proceededValidations = 0;
                        var /** @type {?} */ allValide = true;
                        if (value.length == 0) {
                            resolve(true);
                        }
                        if (typeof value.forEach !== 'function') {
                            var /** @type {?} */ tmp = [];
                            Object.keys(value).forEach(function (v) {
                                tmp.push(value[v]);
                            });
                            value = tmp;
                        }
                        value.forEach(function (itemOriginal) {
                            var /** @type {?} */ item = null;
                            try {
                                // hint: global is used for backend node.js services
                                item = typeof global == 'undefined' ? new typeOfItems() : (typeof typeOfItems == 'string' && global[typeOfItems] !== undefined ? new global[typeOfItems]() : new typeOfItems());
                                item.loadJson(itemOriginal).then().catch();
                            }
                            catch (/** @type {?} */ e) {
                                item = new itemOriginal.constructor();
                            }
                            if (item.validate !== undefined && typeof item.validate == 'function') {
                                item.validate().then(function (isSuccess) {
                                    // validation sucess, so resolve true
                                    proceededValidations++;
                                    if (proceededValidations >= requiredValidations) {
                                        resolve(allValide);
                                    }
                                }).catch(function (error) {
                                    console.log(error);
                                    // validation error, so reject
                                    allValide = false;
                                    proceededValidations++;
                                    if (proceededValidations >= requiredValidations) {
                                        resolve(allValide);
                                    }
                                });
                            }
                            else {
                                // can't be validated, so resolve true
                                proceededValidations++;
                                if (proceededValidations >= requiredValidations) {
                                    resolve(allValide);
                                }
                            }
                        });
                    });
                }
            }
        });
    };
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @param {?=} options
 * @return {?}
 */
function IsTime(options) {
    return function (object, propertyName) {
        classValidator.registerDecorator({
            name: "isTime",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'isTime', value: options }],
            validator: {
                validate: /**
                 * @param {?} value
                 * @param {?} args
                 * @return {?}
                 */
                function (value, args) {
                    return true;
                }
            }
        });
    };
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @param {?=} options
 * @param {?=} validationOptions
 * @return {?}
 */
function IsHidden(options, validationOptions) {
    return function (object, propertyName) {
        var /** @type {?} */ self = this, /** @type {?} */ actionIfMatches = true;
        if (options !== undefined) {
            options.forEach(function (option) {
                if (option.additionalData == undefined) {
                    option.additionalData = {};
                }
                if (option.property == undefined) {
                    option.property = propertyName;
                }
                if (option.validator == undefined) {
                    option.validator = 'equals';
                }
                if (option.type == undefined) {
                    option.type = 'condition';
                }
                if (option.value == undefined) {
                    option.value = true;
                }
                // rewrite nested properties
                if (option.property.indexOf('.') > 0) {
                    option.additionalData.propertyNestedAsNestedObject = option.property;
                    option.property = option.property.substr(0, option.property.indexOf('.'));
                }
            });
        }
        var /** @type {?} */ getNestedValue = function (property, value) {
            if (property.indexOf(".") > 0) {
                return value == undefined ? value : getNestedValue(property.substr(property.indexOf('.') + 1), value[property.substr(0, property.indexOf("."))]);
            }
            else {
                return value == undefined || value[property] == undefined ? undefined : value[property];
            }
        };
        classValidator.registerDecorator({
            name: "isHidden",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'isHidden', 'value': options, 'actionIfMatches': actionIfMatches }],
            options: { groups: ['__isHidden__' + propertyName] },
            validator: {
                validate: /**
                 * @param {?} value
                 * @param {?} args
                 * @return {?}
                 */
                function (value, args) {
                    var /** @type {?} */ validator = new classValidator.Validator();
                    var /** @type {?} */ state = true;
                    var /** @type {?} */ valueNested = null;
                    /**
                                         * iterates over all rules synchronous
                                         */
                    if (options) {
                        options.forEach(function (condition) {
                            if (condition.additionalData.propertyNestedAsNestedObject !== undefined) {
                                valueNested = JSON.parse(JSON.stringify(args.object.__conditionContraintsPropertiesValue[condition.property]));
                                if (typeof valueNested == 'object' && valueNested.forEach !== undefined) {
                                    valueNested.forEach(function (v, i) {
                                        if (typeof v == 'string' && args.object.getHashedValue(v) !== v) {
                                            valueNested[i] = args.object.getHashedValue(v);
                                        }
                                        valueNested[i] = getNestedValue(condition.additionalData.propertyNestedAsNestedObject.substr(condition.additionalData.propertyNestedAsNestedObject.indexOf(".") + 1), valueNested[i]);
                                    });
                                }
                                if (typeof valueNested == 'string') {
                                    if (args.object.getHashedValue(valueNested) !== valueNested) {
                                        valueNested = args.object.getHashedValue(valueNested);
                                    }
                                    valueNested = getNestedValue(condition.additionalData.propertyNestedAsNestedObject.substr(condition.additionalData.propertyNestedAsNestedObject.indexOf(".") + 1), valueNested);
                                }
                                if (valueNested === null && condition.validator.indexOf('array') >= 0) {
                                    valueNested = [];
                                }
                            }
                            if (state) {
                                if (condition.type == 'condition') {
                                    if (valueNested === null && condition.validator == 'equals' && value !== undefined && value !== null && value.length !== undefined && value.length == 0) {
                                        state = true;
                                    }
                                    else {
                                        if (!validator[condition.validator](valueNested ? valueNested : (args.object.__conditionContraintsPropertiesValue[condition.property] === undefined ? args.object[condition.property] : args.object.__conditionContraintsPropertiesValue[condition.property]), condition.value, condition.validatorAdditionalArgument)) {
                                            state = false;
                                        }
                                    }
                                }
                            }
                        });
                    }
                    /**
                                         *  if is in backend service mode, so override property value and condition validator state
                                         */
                    if (args.object.isInBackendMode()) {
                        return true;
                    }
                    return state;
                }
            }
        });
    };
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */

exports.PersistableModel = PersistableModel;
exports.HasBadge = HasBadge;
exports.HasIcon = HasIcon;
exports.HasName = HasName;
exports.HasConditions = HasConditions;
exports.HasDescription = HasDescription;
exports.HasLabel = HasLabel;
exports.HasPlaceholder = HasPlaceholder;
exports.HasPrecision = HasPrecision;
exports.IsBirthDate = IsBirthDate;
exports.IsCalendar = IsCalendar;
exports.IsDateRange = IsDateRange;
exports.IsPassword = IsPassword;
exports.IsPhoneNumber = IsPhoneNumber;
exports.IsRating = IsRating;
exports.IsText = IsText;
exports.IsNumpad = IsNumpad;
exports.IsSelect = IsSelect;
exports.IsList = IsList;
exports.IsTime = IsTime;
exports.IsHidden = IsHidden;
exports.ValidatorConstraint = decorators.ValidatorConstraint;
exports.Validate = decorators.Validate;
exports.ValidateNested = decorators.ValidateNested;
exports.Allow = decorators.Allow;
exports.ValidateIf = decorators.ValidateIf;
exports.IsDefined = decorators.IsDefined;
exports.Equals = decorators.Equals;
exports.NotEquals = decorators.NotEquals;
exports.IsEmpty = decorators.IsEmpty;
exports.IsNotEmpty = decorators.IsNotEmpty;
exports.IsIn = decorators.IsIn;
exports.IsNotIn = decorators.IsNotIn;
exports.IsOptional = decorators.IsOptional;
exports.IsBoolean = decorators.IsBoolean;
exports.IsDate = decorators.IsDate;
exports.IsNumber = decorators.IsNumber;
exports.IsInt = decorators.IsInt;
exports.IsString = decorators.IsString;
exports.IsDateString = decorators.IsDateString;
exports.IsArray = decorators.IsArray;
exports.IsEnum = decorators.IsEnum;
exports.IsDivisibleBy = decorators.IsDivisibleBy;
exports.IsPositive = decorators.IsPositive;
exports.IsNegative = decorators.IsNegative;
exports.Min = decorators.Min;
exports.Max = decorators.Max;
exports.MinDate = decorators.MinDate;
exports.MaxDate = decorators.MaxDate;
exports.IsBooleanString = decorators.IsBooleanString;
exports.IsNumberString = decorators.IsNumberString;
exports.Contains = decorators.Contains;
exports.NotContains = decorators.NotContains;
exports.IsAlpha = decorators.IsAlpha;
exports.IsAlphanumeric = decorators.IsAlphanumeric;
exports.IsAscii = decorators.IsAscii;
exports.IsBase64 = decorators.IsBase64;
exports.IsByteLength = decorators.IsByteLength;
exports.IsCreditCard = decorators.IsCreditCard;
exports.IsCurrency = decorators.IsCurrency;
exports.IsEmail = decorators.IsEmail;
exports.IsFQDN = decorators.IsFQDN;
exports.IsFullWidth = decorators.IsFullWidth;
exports.IsHalfWidth = decorators.IsHalfWidth;
exports.IsVariableWidth = decorators.IsVariableWidth;
exports.IsHexColor = decorators.IsHexColor;
exports.IsHexadecimal = decorators.IsHexadecimal;
exports.IsIP = decorators.IsIP;
exports.IsISBN = decorators.IsISBN;
exports.IsISIN = decorators.IsISIN;
exports.IsISO8601 = decorators.IsISO8601;
exports.IsJSON = decorators.IsJSON;
exports.IsLowercase = decorators.IsLowercase;
exports.IsMobilePhone = decorators.IsMobilePhone;
exports.IsMongoId = decorators.IsMongoId;
exports.IsMultibyte = decorators.IsMultibyte;
exports.IsSurrogatePair = decorators.IsSurrogatePair;
exports.IsUrl = decorators.IsUrl;
exports.IsUUID = decorators.IsUUID;
exports.IsUppercase = decorators.IsUppercase;
exports.Length = decorators.Length;
exports.MinLength = decorators.MinLength;
exports.MaxLength = decorators.MaxLength;
exports.Matches = decorators.Matches;
exports.IsMilitaryTime = decorators.IsMilitaryTime;
exports.ArrayContains = decorators.ArrayContains;
exports.ArrayNotContains = decorators.ArrayNotContains;
exports.ArrayNotEmpty = decorators.ArrayNotEmpty;
exports.ArrayMinSize = decorators.ArrayMinSize;
exports.ArrayMaxSize = decorators.ArrayMaxSize;
exports.ArrayUnique = decorators.ArrayUnique;
exports.IsInstance = decorators.IsInstance;

Object.defineProperty(exports, '__esModule', { value: true });

})));
