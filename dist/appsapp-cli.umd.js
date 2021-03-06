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
        this.__isLoadedRequested = false;
        this.__isAutosave = false;
        this.uuid = '';
        this.__firebaseDatabaseRoot = 'session';
        this.__bindings = {};
        this.__bindingsObserver = {};
        this.__validator = {};
        this.__validatorObserver = {};
        this.__edited = {};
        this.__editedObservableCallbacks = [];
        this.__editedObservableObservers = [];
        this.__temp = {};
        this.__isOnline = true;
        this.__validationErrors = {};
        this.__hasValidationErrors = true;
        this.__metadata = [];
        this.__metadataCache = {};
        this.__hasPendingChanges = false;
        this.__conditionBindings = {};
        this.__conditionActionIfMatches = {};
        this.__conditionActionIfMatchesAction = {};
        this.__conditionActionIfMatchesObserver = {};
        this.__conditionActionIfMatchesRemovedProperties = {};
        this.__conditionContraintsProperties = {};
        this.__conditionContraintsPropertiesValue = {};
        this.__conditionContraintsAffectedProperties = {};
        this.tmp__hashedValues = {};
        this.__listArrays = {};
        this.__listArraysParentWatcher = {};
        this.__isPersistableModel = true;
        var /** @type {?} */ self = this;
        this.__metadata = classValidator.getFromContainer(classValidator.MetadataStorage).getTargetValidationMetadatas(this.constructor, '');
        // transform initally property values
        this.transformAllProperties(true);
        // check if all loaded metadata has corresponding properties
        this.__metadata.forEach(function (metadata) {
            if (_this[metadata.propertyName] == undefined) {
                _this[metadata.propertyName] = null;
            }
        });
        /**
                 * create observerable and observer for handling the models data changes
                 */
        this.__editedObservable = new rxjs.Observable(function (observer) {
            self.__editedObserver = observer;
        });
        //this.loaded().then(() => {
        self.__init();
        // autovalidation
        this.getChangesWithCallback(function () {
            if (!_this.__isAutosave) {
                self.removeConditionProperties();
                classValidator.validate(self, { skipMissingProperties: true }).then(function (errors) {
                    if (errors.length) {
                        self.__hasValidationErrors = true;
                    }
                    else {
                        self.__hasValidationErrors = false;
                    }
                });
            }
        });
        // });
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
            if (self.__bindingsObserver) {
                self.__editedObservableObservers.forEach(function (callback) {
                    if (next[callback.property] !== undefined) {
                        var /** @type {?} */ lastValue = null;
                        try {
                            lastValue = objectHash.sha1(next[callback.property]);
                        }
                        catch (/** @type {?} */ e) {
                            lastValue = next[callback.property];
                        }
                        if (lastValue !== callback.lastValue) {
                            callback.callback(next[callback.property]);
                            callback.lastValue = lastValue;
                        }
                    }
                });
                Object.keys(self.__bindingsObserver).forEach(function (property) {
                    if (next[property] !== undefined) {
                        self.executeConditionValidatorCircular(property);
                        self.__bindingsObserver[property].next(next[property]);
                    }
                });
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
            self.loaded().then(function (model) {
                model.loaded().then(function (model) {
                    model.getPersistenceManager().trigger(model, observer, {
                        name: 'custom',
                        data: {
                            name: action
                        }
                    }, interval, maxExecutions);
                });
            });
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
            self.loaded().then(function (model) {
                model.getPersistenceManager().trigger(model, observer, {
                    name: 'webhook',
                    data: {
                        url: url,
                        method: method,
                        type: type
                    }
                });
            });
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
        var /** @type {?} */ self = this;
        return new rxjs.Observable(function (observer) {
            if (typeof action === 'string') {
                action = {
                    name: 'custom',
                    data: {
                        name: action
                    }
                };
            }
            self.loaded().then(function (model) {
                model.executeSave(action).subscribe(function (next) {
                    if (observer) {
                        observer.next(next);
                    }
                }, function (error) {
                    if (observer) {
                        observer.error(error);
                    }
                }, function () {
                    if (observer) {
                        observer.next(model);
                        observer.complete();
                    }
                });
            });
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
            self.loaded().then(function (model) {
                if (model.__persistenceManager) {
                    observer.next({ message: model.getMessage('submitted'), target: model });
                    model.__persistenceManager.save(self, observer, action).then(function (success) {
                        model.__edited = {};
                        observer.complete();
                    }).catch(function (error) {
                        model.__edited = {};
                        observer.error(error);
                    });
                }
                else {
                    observer.error('No persistence Manger provided');
                    model.__edited = {};
                }
            });
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
            self[property] = self.transformTypeFromMetadata(property, '');
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
        this.uuid = uuid !== undefined ? uuid : angular2Uuid.UUID.UUID();
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
        return this.uuid;
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
        if (this.getFirebaseDatabasePath() !== undefined) {
            return this.__firebaseDatabaseRoot + '/' + this.getFirebaseDatabasePath().substr(this.__firebaseDatabaseRoot.length + 1).split("/")[0] + '/' + this.getFirebaseDatabasePath().substr(this.__firebaseDatabaseRoot.length + 1).split("/")[1] + path.substr(1);
        }
        else {
            return null;
        }
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
                self.__bindings[property].subscribe();
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
                var /** @type {?} */ lastValue = null;
                try {
                    lastValue = objectHash.sha1(value);
                }
                catch (/** @type {?} */ e) {
                    lastValue = value;
                }
                if (lastValue !== callback.lastValue) {
                    callback.callback(value);
                    callback.lastValue = lastValue;
                }
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
            this.save(null).subscribe(function (next) {
            }, function (error) {
                //
            });
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
            return this.__edited[property] !== undefined ? this.__edited[property] : this[property];
        }
        else {
            return this[property];
        }
    };
    /**
     * return current property value unhashed
     * @param {?} property
     * @return {?}
     */
    PersistableModel.prototype.get = /**
     * return current property value unhashed
     * @param {?} property
     * @return {?}
     */
    function (property) {
        if (this.__isLoadedRequested === false && this.getAppsAppModuleProvider()) {
            this.__isLoadedRequested = true;
            this.getAppsAppModuleProvider().lazyLoad(this);
        }
        return this.getHashedValue(this[property]);
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
            if (property.substr(0, 1) !== '_' && property.substr(0, 5) !== 'tmp__') {
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
     * get properties keys
     * @return {?}
     */
    PersistableModel.prototype.getPropertiesKeys = /**
     * get properties keys
     * @return {?}
     */
    function () {
        var /** @type {?} */ keys = [], /** @type {?} */ self = this, /** @type {?} */ keysO = {};
        Object.keys(self).forEach(function (property) {
            if (keysO[property] === undefined && property.substr(0, 1) !== '_' && property.substr(0, 5) !== 'tmp__') {
                keysO[property] = true;
                keys.push(property);
            }
        });
        if (this.__metadata) {
            this.__metadata.forEach(function (metadata) {
                if (keysO[metadata.propertyName] == undefined) {
                    keysO[metadata.propertyName] = true;
                    keys.push(metadata.propertyName);
                }
            });
        }
        return keys;
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
        self.getPropertiesKeys().forEach(function (property) {
            if (self.getMetadataValue(property, 'isList', null, 'usePropertyAsUuid')) {
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
     * add a new list entry
     * @param {?} property
     * @param {?=} data (json object, persistable model or array of those
     * @param {?=} uuid string
     * @param {?=} internal boolean
     * @return {?}
     */
    PersistableModel.prototype.add = /**
     * add a new list entry
     * @param {?} property
     * @param {?=} data (json object, persistable model or array of those
     * @param {?=} uuid string
     * @param {?=} internal boolean
     * @return {?}
     */
    function (property, data, uuid, internal) {
        var /** @type {?} */ self = this, /** @type {?} */ model = self;
        if (data === undefined) {
            data = {};
        }
        if (model.getMetadataValue(property, 'isList')) {
            var /** @type {?} */ toAddModels = [];
            var /** @type {?} */ toCreateModels = [];
            if (data.__isPersistableModel !== undefined) {
                toAddModels.push(data);
            }
            else if (typeof data == 'object' && data.length !== undefined) {
                data.forEach(function (d) {
                    if (d.__isPersistableModel !== undefined) {
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
                    uuid = d !== undefined ? d[model.getMetadataValue(property, 'isList', null, 'usePropertyAsUuid')] : null;
                }
                if (uuid === undefined || !uuid) {
                    uuid = data['uuid'] == undefined ? angular2Uuid.UUID.UUID() : data['uuid'];
                }
                if (typeof d == 'object' && d.length == 1 && d[0] !== undefined) {
                    d = d[0];
                }
                var /** @type {?} */ n = null;
                if (model.isInBackendMode()) {
                    // backend mode
                    var /** @type {?} */ constructor = typeof model.getMetadataValue(property, 'isList') == 'function' ? model.getMetadataValue(property, 'isList') : global[model.getMetadataValue(property, 'isList')];
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
                    toAddModels.push(n);
                }
                else {
                    n = model.createNewLazyLoadedPersistableModel(model.getAppsAppModuleProvider(), model.getMetadataValue(property, 'isList'), uuid, d);
                    var /** @type {?} */ usePropertyAsUuid = model.getMetadataValue(property, 'isList', null, 'usePropertyAsUuid');
                    if (usePropertyAsUuid) {
                        n.watch(usePropertyAsUuid, function (uuid) {
                            if (uuid && typeof uuid == 'string' && uuid.length) {
                                n.setUuid(uuid);
                                model.refreshListArray(property);
                            }
                        });
                    }
                    n.setParent(self);
                    if (self.__isAutosave) {
                        n.autosave();
                    }
                    // force conditions to be calculated initially
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
                    toAddModels.push(n);
                }
            });
            toAddModels.forEach(function (d) {
                model[property].push(d);
            });
            if (!this.isInBackendMode() && this.__isAutosave) {
                this.save().subscribe();
            }
            model.refreshListArray(property, model[property]);
        }
        return this;
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
                if (uuidOrObject.__isPersistableModel) {
                    toRemoveUuids[uuidOrObject.getUuid()] = true;
                }
                else {
                    uuidOrObject.forEach(function (o) {
                        if (uuidOrObject.__isPersistableModel) {
                            toRemoveUuids[o.getUuid()] = true;
                        }
                        else {
                            toRemoveUuids[o] = true;
                        }
                    });
                }
            }
            this.getPropertyValue(property).forEach(function (m) {
                if (m.getUuid().length === 0 || toRemoveUuids[m.getUuid()] === undefined) {
                    afterRemovedValue.push(m);
                }
            });
            this.setProperty(property, this.transformTypeFromMetadata(property, afterRemovedValue));
        }
        else {
            this.setProperty(property, this.transformTypeFromMetadata(property, null));
        }
        if (this.__isAutosave) {
            this.save().subscribe();
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
        this[property] = this.transformTypeFromMetadata(property, '');
        this.setProperty(property, this[property]);
        this.emit();
        if (this.__isAutosave) {
            this.save().subscribe();
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
        if (this.uuid.length == 0) {
            this.uuid = angular2Uuid.UUID.UUID();
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
                        resolve(self);
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
                    resolve(self);
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
            return (Object.keys(this.__edited).length) ? true : false;
        }
    };
    /**
     * load json data
     * @param {?} json
     * @param {?=} clone boolean
     * @return {?}
     */
    PersistableModel.prototype.loadJson = /**
     * load json data
     * @param {?} json
     * @param {?=} clone boolean
     * @return {?}
     */
    function (json, clone) {
        var /** @type {?} */ self = this;
        json = typeof json == 'string' ? JSON.parse(json) : json;
        var /** @type {?} */ model = /** @type {?} */ (classTransformer.plainToClass(/** @type {?} */ (this.constructor), json, { excludePrefixes: ["__"] }));
        if (model) {
            if (clone === true || json === null) {
                return model;
            }
            else {
                model['tmp__hashedValues'] = {};
                if (self['tmp__hashedValues'] === undefined) {
                    self['tmp__hashedValues'] = {};
                }
                if (json['tmp__hashedValues'] !== undefined && json['tmp__hashedValues'] !== null) {
                    Object.keys(json['tmp__hashedValues']).forEach(function (key) {
                        self['tmp__hashedValues'][key] = json['tmp__hashedValues'][key];
                        model['tmp__hashedValues'][key] = json['tmp__hashedValues'][key];
                    });
                }
                Object.keys(json).forEach(function (property) {
                    if (property.substr(0, 2) !== '__' || property.substr(0, 5) == 'tmp__') {
                        if ((self.isInBackendMode() || self.__edited[property] === undefined || self.__edited[property] === null)) {
                            if (property.substr(0, 5) == 'tmp__' || property.substr(0, 1) == '_') {
                                self[property] = model[property];
                            }
                            else {
                                self[property] = self.transformTypeFromMetadata(property, model[property]);
                            }
                        }
                    }
                });
                if (self.getParent()) {
                    // update external changes to parent model
                    self.getParent().save().subscribe();
                }
                self.refreshAllListArrays();
                self.validate().then(function (success) {
                    self.emit();
                }).catch(function (error) {
                    Object.keys(error).forEach(function (e) {
                        self['__validationErrors'][e.property] = true;
                    });
                });
            }
        }
        return self;
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
        return this.transformTypeFromMetadataExecute(property, value);
    };
    /**
     * transform type from metadata to avoid non matching data types
     * @param {?} property
     * @param {?} value
     * @return {?}
     */
    PersistableModel.prototype.transformTypeFromMetadataExecute = /**
     * transform type from metadata to avoid non matching data types
     * @param {?} property
     * @param {?} value
     * @return {?}
     */
    function (property, value) {
        var _this = this;
        var /** @type {?} */ self = this;
        if (typeof value === 'function') {
            return value;
        }
        if (this.hasMetadata(property, 'isBoolean')) {
            return typeof value == 'boolean' ? value : false;
        }
        if (this.hasMetadata(property, 'isTime')) {
            return typeof value == 'string' ? new Date(value) : (value ? value : new Date());
        }
        if (this.hasMetadata(property, 'isDate')) {
            return value ? new Date(value) : (value ? value : new Date());
        }
        if (this.hasMetadata(property, 'isInt')) {
            var /** @type {?} */ v = typeof value == 'number' ? value : parseInt(value);
            return isNaN(v) || typeof v !== 'number' ? 0 : v;
        }
        if (this.hasMetadata(property, 'isNumber')) {
            return value === undefined || typeof value !== 'number' ? 0 : value;
        }
        if (this.hasMetadata(property, 'isCalendar')) {
            return value ? new Date(value) : (value ? value : new Date());
        }
        if (this.hasMetadata(property, 'isBirthDate')) {
            return value ? new Date(value) : (value ? value : new Date());
        }
        if (this.hasMetadata(property, 'isDateRange')) {
            return typeof value == 'object' ? value : [];
        }
        if (this.hasMetadata(property, 'isList')) {
            if (value && typeof value.forEach !== 'function') {
                var /** @type {?} */ tmp = [];
                Object.keys(value).forEach(function (v) {
                    tmp.push(value[v]);
                });
                value = tmp;
            }
            if (!value) {
                value = [];
            }
            if (!this[property]) {
                this[property] = [];
            }
            if (self.isInBackendMode()) {
                this[property] = [];
                value.forEach(function (itemOriginal) {
                    var /** @type {?} */ uuid = itemOriginal[self.getMetadataValue(property, 'isList', null, 'usePropertyAsUuid')];
                    _this.add(property, itemOriginal, uuid, true);
                });
            }
            else {
                // merge lists values
                var /** @type {?} */ uuidsOld_1 = {}, /** @type {?} */ uuidsNew_1 = {}, /** @type {?} */ uuidToRemove_1 = {};
                value.forEach(function (i) {
                    if (i.uuid !== undefined) {
                        uuidsNew_1[i.uuid] = true;
                    }
                });
                this[property].forEach(function (i) {
                    if (i.uuid !== undefined) {
                        uuidsOld_1[i.uuid] = i;
                    }
                    if (uuidsNew_1[i.uuid] === undefined) {
                        uuidToRemove_1[i.uuid] = true;
                    }
                });
                // add and update
                value.forEach(function (itemOriginal) {
                    var /** @type {?} */ uuid = itemOriginal[self.getMetadataValue(property, 'isList', null, 'usePropertyAsUuid')];
                    if (uuid === undefined && itemOriginal.uuid !== undefined) {
                        uuid = itemOriginal.uuid;
                    }
                    if (uuidsOld_1[uuid] !== undefined) {
                        if (itemOriginal.__isPersistableModel === undefined) {
                            Object.keys(itemOriginal).forEach(function (property) {
                                if (property.substr(0, 2) !== '__' || property.substr(0, 5) == 'tmp__') {
                                    //uuidsOld[uuid][property] = uuidsOld[uuid].transformTypeFromMetadata(property, itemOriginal[property]);
                                    //uuidsOld[uuid][property] = uuidsOld[uuid].transformTypeFromMetadata(property, itemOriginal[property]);
                                    uuidsOld_1[uuid].setProperty(property, uuidsOld_1[uuid].transformTypeFromMetadata(property, itemOriginal[property]));
                                }
                            });
                        }
                        else {
                            uuidsOld_1[uuid] = itemOriginal;
                        }
                    }
                    else {
                        _this.add(property, itemOriginal, uuid, true);
                    }
                });
                // remove
                this[property].forEach(function (item, i) {
                    if (uuidToRemove_1[item.uuid] === true) {
                        _this[property].splice(i, 1);
                        try {
                            delete _this[property][item.uuid];
                        }
                        catch (/** @type {?} */ e) {
                            //
                        }
                    }
                });
            }
            this.refreshListArray(property);
            return this[property];
        }
        if (this.hasMetadata(property, 'isSelect')) {
            if (this.isInBackendMode()) {
                var /** @type {?} */ values = typeof value == 'object' ? value : [];
                var /** @type {?} */ realValues_1 = [];
                if (values && values.length) {
                    values.forEach(function (val) {
                        realValues_1.push(self.getHashedValue(val));
                    });
                    value = realValues_1;
                }
                else {
                    value = values;
                }
                this.setProperty(property, value);
            }
            this.executeConditionValidatorCircular(property);
        }
        return value === null ? '' : value;
    };
    /**
     * Transform all properties
     * @param {?=} sync boolean
     * @return {?}
     */
    PersistableModel.prototype.transformAllProperties = /**
     * Transform all properties
     * @param {?=} sync boolean
     * @return {?}
     */
    function (sync) {
        var /** @type {?} */ self = this;
        if (self.isInBackendMode() || sync === true) {
            self.getPropertiesKeys().forEach(function (property) {
                self[property] = self.transformTypeFromMetadata(property, self.getPropertyValue(property));
            });
        }
        else {
            window.setTimeout(function () {
                self.getPropertiesKeys().forEach(function (property) {
                    self[property] = self.transformTypeFromMetadata(property, self.getPropertyValue(property));
                });
            });
        }
        return this;
    };
    /**
     * Transform all properties by given type
     * @param {?} type string
     * @return {?}
     */
    PersistableModel.prototype.transformAllPropertiesByType = /**
     * Transform all properties by given type
     * @param {?} type string
     * @return {?}
     */
    function (type) {
        var _this = this;
        var /** @type {?} */ self = this;
        self.getPropertiesKeys().forEach(function (property) {
            if (_this.getMetadata(property, type).length) {
                self[property] = self.transformTypeFromMetadata(property, self[property]);
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
        return this.__hasPendingChanges;
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
        this.__hasPendingChanges = state;
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
     * @param {?} property
     * @param {?} type
     * @return {?} boolean
     */
    PersistableModel.prototype.hasMetadata = /**
     * get properties metatadata
     * @param {?} property
     * @param {?} type
     * @return {?} boolean
     */
    function (property, type) {
        var /** @type {?} */ has = false;
        this.__metadata.forEach(function (metadata) {
            if (!has && ((metadata && metadata.type == type) || (metadata.constraints && metadata.constraints[0] && metadata.constraints[0].type == type)) && metadata.propertyName == property) {
                has = true;
            }
        });
        return has;
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
        if (property === 'uuid') {
            return null;
        }
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
            'isRequired': null,
            'isEqualTo': null,
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
            if (self.__isLoadedPromiseInternalResolver) {
                self.__isLoadedPromiseInternalResolver(self);
            }
            self.__isLoaded = true;
        });
        return this;
    };
    /**
     * get is loaded promise
     * @return {?}
     */
    PersistableModel.prototype.getIsLoadedPromise = /**
     * get is loaded promise
     * @return {?}
     */
    function () {
        return this.__isLoadedPromise;
    };
    /**
     * get is loaded
     * @return {?}
     */
    PersistableModel.prototype.isLoaded = /**
     * get is loaded
     * @return {?}
     */
    function () {
        return this.__isLoaded;
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
        if (self.__isLoaded || self.isInBackendMode()) {
            return new Promise(function (resolve, reject) {
                resolve(self);
            });
        }
        else {
            if (this.getAppsAppModuleProvider() !== undefined && this.__isLoadedPromise == undefined) {
                self.getAppsAppModuleProvider().lazyLoad(self);
            }
            if (this.__isLoadedPromise == undefined) {
                if (this.__isLoadedPromiseInternal === undefined) {
                    this.__isLoadedPromiseInternal = new Promise(function (resolve, reject) {
                        self.__isLoadedPromiseInternalResolver = resolve;
                        if (self.__isLoaded) {
                            resolve(self);
                        }
                    });
                }
                return this.__isLoadedPromiseInternal;
            }
            else {
                return this.__isLoadedPromise;
            }
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
        Object.keys(this.tmp__hashedValues).forEach(function (hash) {
            values.push({ value: self.tmp__hashedValues[hash], hash: hash });
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
        this.tmp__hashedValues[hash] = value;
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
        var _this = this;
        if (typeof hash == 'string') {
            return this.tmp__hashedValues[hash] !== undefined ? this.tmp__hashedValues[hash] : hash;
        }
        else {
            if (hash && typeof hash == 'object' && typeof hash.length == 'function') {
                var /** @type {?} */ values_1 = [];
                hash.forEach(function (value) {
                    values_1.push(_this.tmp__hashedValues[value] !== undefined ? _this.tmp__hashedValues[value] : value);
                });
                return values_1;
            }
        }
        return hash;
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
        if (hash !== value) {
            this.tmp__hashedValues[hash] = value;
        }
        return hash;
    };
    /**
     * creates new lazy loaded persistable model
     * @param {?} appsAppModuleProvider
     * @param {?} constructor
     * @param {?=} uuid
     * @param {?=} data
     * @return {?}
     */
    PersistableModel.prototype.createNewLazyLoadedPersistableModel = /**
     * creates new lazy loaded persistable model
     * @param {?} appsAppModuleProvider
     * @param {?} constructor
     * @param {?=} uuid
     * @param {?=} data
     * @return {?}
     */
    function (appsAppModuleProvider, constructor, uuid, data) {
        var /** @type {?} */ o = new constructor();
        if (uuid !== undefined) {
            o.setUuid(uuid);
        }
        if (data !== undefined) {
            o.loadJson(data);
        }
        o.setAppsAppModuleProvider(appsAppModuleProvider);
        return o;
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
        var /** @type {?} */ lastValue = null;
        try {
            lastValue = objectHash.sha1(this[property]);
        }
        catch (/** @type {?} */ e) {
            lastValue = this[property];
        }
        callback(this[property]);
        this.__editedObservableObservers.push({ callback: callback, property: property, lastValue: lastValue });
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
        return global[this.constructor.name] === undefined && global['appsapp-backend-mode'] === undefined ? false : true;
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
        return Object.keys(this.__validationErrors).length || this.__hasValidationErrors ? false : true;
    };
    /**
     * create list array
     * @param {?} property
     * @param {?=} reset
     * @return {?}
     */
    PersistableModel.prototype.createListArray = /**
     * create list array
     * @param {?} property
     * @param {?=} reset
     * @return {?}
     */
    function (property, reset) {
        var /** @type {?} */ self = this;
        if (reset !== undefined) {
            try {
                delete this.__listArrays[property];
            }
            catch (/** @type {?} */ e) {
                //
            }
        }
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
        if (this.getMetadataValue(property, 'isList')) {
            var /** @type {?} */ properties_1 = {}, /** @type {?} */ v = value == undefined ? this.getPropertyValue(property) : value;
            if (v && v.length) {
                v.forEach(function (item) {
                    if (item && item.__isPersistableModel && item.getUuid() && item.getUuid().length) {
                        properties_1[item.getUuid()] = {
                            value: item,
                            enumerable: false,
                            configurable: true
                        };
                    }
                });
            }
            if (Object.keys(properties_1).length) {
                Object.defineProperties(this[property], properties_1);
            }
        }
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
        self.getPropertiesKeys().forEach(function (property) {
            if (self.getMetadataValue(property, 'isList', null, 'usePropertyAsUuid')) {
                _this.refreshListArray(property);
            }
        });
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
            // rewrite nested properties
            if (option.property.indexOf('.') > 0) {
                option.additionalData.propertyNestedAsNestedObject = option.property;
                option.property = option.property.substr(0, option.property.indexOf('.'));
            }
        });
        var /** @type {?} */ getNestedValue = function (property, ovalue, model) {
            var /** @type {?} */ value = model.getHashedValue(ovalue);
            if (property.indexOf(".") > 0) {
                return value === undefined ? value : getNestedValue(property.substr(property.indexOf('.') + 1), value[property.substr(0, property.indexOf("."))], model);
            }
            else {
                return value === undefined || value[property] === undefined ? undefined : value[property];
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
                    /**
                     * iterates over all rules synchronous
                     */
                    if (options) {
                        options.forEach(function (condition) {
                            if (condition.additionalData.propertyNestedAsNestedObject !== undefined) {
                                valueNested = args.object.__conditionContraintsPropertiesValue[condition.property] !== undefined ? args.object.getHashedValue(JSON.parse(JSON.stringify(args.object.__conditionContraintsPropertiesValue[condition.property]))) : null;
                                if (valueNested && typeof valueNested == 'object' && valueNested.forEach !== undefined) {
                                    valueNested.forEach(function (v, i) {
                                        valueNested[i] = getNestedValue(condition.additionalData.propertyNestedAsNestedObject.substr(condition.additionalData.propertyNestedAsNestedObject.indexOf(".") + 1), valueNested[i], args.object);
                                    });
                                }
                                if (valueNested && typeof valueNested == 'string') {
                                    if (args.object.getHashedValue(valueNested) !== valueNested) {
                                        valueNested = args.object.getHashedValue(valueNested);
                                    }
                                    valueNested = getNestedValue(condition.additionalData.propertyNestedAsNestedObject.substr(condition.additionalData.propertyNestedAsNestedObject.indexOf(".") + 1), valueNested, args.object);
                                }
                                if (valueNested === null && condition.validator.indexOf('array') >= 0) {
                                    valueNested = [];
                                }
                            }
                            if (state) {
                                if (valueNested !== undefined && condition.type == 'condition') {
                                    if (valueNested === null && condition.validator == 'equals' && value !== undefined && condition.value !== null && condition.value.length !== undefined && value.length == 0) {
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
                    else {
                        state = false;
                    }
                    /**
                                         *  if is in backend service mode, so override property value and condition validator state
                                         */
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
 * @param {?=} labelPosition
 * @param {?=} validationOptions
 * @return {?}
 */
function HasLabel(label, labelPosition, validationOptions) {
    return function (object, propertyName) {
        classValidator.registerDecorator({
            name: "hasLabel",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'hasLabel', 'value': { label: label, labelPosition: labelPosition ? labelPosition : 'after' } }],
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
 * @param {?} color
 * @param {?=} validationOptions
 * @return {?}
 */
function HasColor(color, validationOptions) {
    return function (object, propertyName) {
        classValidator.registerDecorator({
            name: "hasColor",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'hasColor', 'value': color }],
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
function HasClearable(validationOptions) {
    return function (object, propertyName) {
        classValidator.registerDecorator({
            name: "hasClearable",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'hasClearable', 'value': true }],
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
                                        else if (optionValidator.source.url.substr(0, 1) == '/') {
                                            resolveOptions([]);
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
                                return true;
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
            constraints: [{
                    'type': 'isList',
                    'value': typeOfItems,
                    'usePropertyAsUuid': usePropertyAsUuid,
                    'uniqueItems': uniqueItems == undefined ? false : uniqueItems
                }],
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
                            if (itemOriginal.__isPersistableModel) {
                                item = itemOriginal;
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
                            }
                            else {
                                resolve(true);
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
/**
 * @param {?=} validationOptions
 * @return {?}
 */
function IsRequired(validationOptions) {
    return function (object, propertyName) {
        classValidator.registerDecorator({
            name: "isRequired",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'isRequired', 'value': true }],
            options: validationOptions,
            validator: {
                validate: /**
                 * @param {?} value
                 * @param {?} args
                 * @return {?}
                 */
                function (value, args) {
                    return value && value !== undefined ? true : false;
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
 * @param {?} property
 * @return {?}
 */
function IsEqualTo(property) {
    return function (object, propertyName) {
        classValidator.registerDecorator({
            name: "isEqualTo",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'isEqualTo' }],
            validator: {
                validate: /**
                 * @param {?} value
                 * @param {?} args
                 * @return {?}
                 */
                function (value, args) {
                    var /** @type {?} */ object = args.object;
                    return value === object[property];
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
exports.HasColor = HasColor;
exports.HasClearable = HasClearable;
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
exports.IsRequired = IsRequired;
exports.IsEqualTo = IsEqualTo;
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
