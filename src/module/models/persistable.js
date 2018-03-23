"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var class_validator_1 = require("class-validator");
var class_transformer_1 = require("class-transformer");
var class_validator_2 = require("class-validator");
var class_validator_3 = require("class-validator");
var angular2_uuid_1 = require("angular2-uuid");
var objectHash = require("object-hash");
var rxjs_1 = require("rxjs");
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
        this.__isOnline = true;
        this.__validationErrors = {};
        this.__loadedProperty = {};
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
        this.tmp__hashedValues = {};
        this.__propertySymbols = {};
        this.__listArrays = {};
        this.__isPersistableModel = true;
        var self = this;
        this.__metadata = class_validator_2.getFromContainer(class_validator_3.MetadataStorage).getTargetValidationMetadatas(this.constructor, '');
        // check if all loaded metadata has corresponding properties
        this.__metadata.forEach(function (metadata) {
            if (_this[metadata.propertyName] == undefined) {
                _this[metadata.propertyName] = null;
            }
        });
        /**
         * create observerable and observer for handling the models data changes
         */
        this.__editedObservable = new rxjs_1.Observable(function (observer) {
            self.__editedObserver = observer;
        });
        // self.transformAllProperties();
        this.loaded().then(function () {
            self.__init();
        });
    }
    /**
     *
     * @private
     */
    PersistableModel.prototype.__init = function () {
        var _this = this;
        var self = this;
        /**
         * create observerable and observer for handling the models data changes
         */
        this.__editedObservable = new rxjs_1.Observable(function (observer) {
            self.__editedObserver = observer;
        });
        /**
         * create observerable and observer for handling the models data changes
         */
        this.__observable = new rxjs_1.Observable(function (observer) {
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
                        if (next[callback.property] !== undefined) {
                            var lastValue = null;
                            try {
                                lastValue = objectHash.sha1(next[callback.property]);
                            }
                            catch (e) {
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
            }
        });
    };
    /**
     * get http client
     * @returns HttpClient
     */
    PersistableModel.prototype.getHttpClient = function () {
        return this.__httpClient;
    };
    /**
     * set http client
     * @param HttpClient http
     * @returns {PersistableModel}
     */
    PersistableModel.prototype.setHttpClient = function (http) {
        this.__httpClient = http;
        return this;
    };
    /**
     * call next method on observer
     * @returns {PersistableModel}
     */
    PersistableModel.prototype.emit = function () {
        if (this.__observer) {
            this.__observer.next(this);
        }
        return this;
    };
    /**
     * save with optional observable
     * @param action
     * @returns {Promise<any>}
     */
    PersistableModel.prototype.saveWithPromise = function (action) {
        var self = this;
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
     * @param action
     * @returns {Promise<any>}
     */
    PersistableModel.prototype.action = function (action) {
        var self = this;
        var observable = new rxjs_1.Observable(function (observer) {
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
     * @param string action
     * @param integer interval repeat this trigger every interval seconds
     * @param integer maximal successfully execution counts
     * @returns {Observable<any>}
     */
    PersistableModel.prototype.trigger = function (action, interval, maxExecutions) {
        var self = this;
        return new rxjs_1.Observable(function (observer) {
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
     * @param {string} url
     * @param {"get" | "post" | "head" | "put" | "patch" | "delete"} method
     * @param {"json" | "html" | "xml"} type
     * @returns {Observable<any>}
     */
    PersistableModel.prototype.webhook = function (url, method, type) {
        var self = this;
        return new rxjs_1.Observable(function (observer) {
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
     * @param action
     * @returns {Observable<any>}
     */
    PersistableModel.prototype.save = function (action) {
        var self = this;
        return new rxjs_1.Observable(function (observer) {
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
     * @param {any} action as an optinal argument for transmitting additional action metadata
     * @returns {Observable<any>}
     */
    PersistableModel.prototype.executeSave = function (action) {
        var self = this;
        Object.keys(self.__edited).forEach(function (property) {
            self[property] = self.__edited[property];
        });
        return new rxjs_1.Observable(function (observer) {
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
     * @returns {PersistableModel}
     */
    PersistableModel.prototype.reset = function () {
        var self = this;
        Object.keys(self.getProperties()).forEach(function (property) {
            self[property] = self.transformTypeFromMetadata(property, '');
        });
        self.__edited = {};
        return this;
    };
    /**
     * removes edited states
     * @returns {PersistableModel}
     */
    PersistableModel.prototype.removeEditedState = function () {
        this.__edited = {};
        return this;
    };
    /**
     * get models observer
     * @returns {Observer<any>}
     */
    PersistableModel.prototype.getObserver = function () {
        return this.__observer;
    };
    /**
     * get models obervable
     * @returns {Observable<any>}
     */
    PersistableModel.prototype.getObservable = function () {
        return this.__observable;
    };
    /**
     * set uuid
     * @param uuid
     * @returns {PersistableModel}
     */
    PersistableModel.prototype.setUuid = function (uuid) {
        this.__uuid = uuid !== undefined ? uuid : angular2_uuid_1.UUID.UUID();
        return this;
    };
    /**
     * get uuid
     * @returns {string}
     */
    PersistableModel.prototype.getUuid = function () {
        return this.__uuid;
    };
    /**
     * get models constructors name as an object identifier
     * return {string}
     */
    PersistableModel.prototype.getObjectIdentifier = function () {
        return this.constructor.name;
    };
    /**
     * set firebaseDatabase
     * @param {AngularFireDatabase}
     * @returns {PersistableModel}
     */
    PersistableModel.prototype.setFirebaseDatabase = function (firebaseDatabase) {
        this.__firebaseDatabase = firebaseDatabase;
        var self = this;
        var connectedRef = this.__firebaseDatabase.app.database().ref(".info/connected");
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
     * @returns {AngularFireDatabase}
     */
    PersistableModel.prototype.getFirebaseDatabase = function () {
        return this.__firebaseDatabase;
    };
    /**
     * set firebase database path
     * @param path
     * @returns {PersistableModel}
     */
    PersistableModel.prototype.setFirebaseDatabasePath = function (path) {
        this.__firebaseDatabasePath = path;
        this.registerConditionValidators(false);
        return this;
    };
    /**
     * get firebase database path
     * @returns {string}
     */
    PersistableModel.prototype.getFirebaseDatabasePath = function () {
        return this.__firebaseDatabasePath;
    };
    /**
     * get firebase session data path
     * @param string path
     * @returns string
     */
    PersistableModel.prototype.getFirebaseDatabaseSessionPath = function (path) {
        var a = path.split("/");
        var path = '';
        var i = 0;
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
     * @param firebaseDatabaseObject
     * @returns {PersistableModel}
     */
    PersistableModel.prototype.setFirebaseDatabaseObject = function (firebaseDatabaseObject) {
        this.__angularFireObject = firebaseDatabaseObject;
        return this;
    };
    /**
     * get firebaseDatabaseObject
     * @returns {AngularFireObject<any>}
     */
    PersistableModel.prototype.getFirebaseDatabaseObject = function () {
        return this.__angularFireObject;
    };
    /**
     * get firebaseDatabase prefix
     * @returns string
     */
    PersistableModel.prototype.getFirebaseDatabaseRoot = function () {
        return this.__firebaseDatabaseRoot;
    };
    /**
     * set firebase databse path prefix
     * @param path
     * @returns {PersistableModel}
     */
    PersistableModel.prototype.setFirebaseDatabaseRoot = function (path) {
        this.__firebaseDatabaseRoot = path;
        return this;
    };
    /**
     * get property
     * @param string property
     * @returns {any}
     */
    PersistableModel.prototype.getProperty = function (property) {
        var self = this;
        if (this.isInBackendMode()) {
            return self.getPropertyValue(property);
        }
        else {
            if (!self.__bindings[property]) {
                self.__bindings[property] = new rxjs_1.Observable(function (observer) {
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
     * @returns {Observer<any>}
     */
    PersistableModel.prototype.getPropertyObserver = function (property) {
        if (this.__bindingsObserver[property]) {
            return this.__bindingsObserver[property];
        }
        else {
            return null;
        }
    };
    /**
     * set module provider messages
     * @param {AppsappModuleProviderMessages} messages
     * @returns {PersistableModel}
     */
    PersistableModel.prototype.setMessages = function (messages) {
        this.__messages = messages;
        return this;
    };
    /**
     * get modules providers message
     * @param keyword
     * @returns {any}
     */
    PersistableModel.prototype.getMessage = function (keyword) {
        if (this.__messages === undefined) {
            return keyword;
        }
        return this.__messages[keyword] == undefined ? keyword : this.__messages[keyword];
    };
    /**
     * set property value for using as an binding variable
     * @param {string} property
     * @param {any} value
     * @returns {PersistableModel}
     */
    PersistableModel.prototype.setProperty = function (property, value) {
        var _this = this;
        var self = this, autosave = false;
        if (this.__isAutosave && this[property] !== value) {
            autosave = true;
        }
        self.__editedObservableObservers.forEach(function (callback) {
            if (callback.property == property && _this[property] !== value) {
                var lastValue = null;
                try {
                    lastValue = objectHash.sha1(value);
                }
                catch (e) {
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
        var event = { property: property, value: value, model: this };
        if (this.__editedObserver) {
            this.__editedObserver.next(event);
        }
        this.executeConditionValidatorCircular(property);
        this.executeChangesWithCallback(event);
        if (autosave) {
            this.save(null).subscribe(function (next) {
            }, function (error) {
            });
        }
        return this;
    };
    /**
     * return current property value
     * @param property
     * @param {boolean} get value is in editing mode
     * @returns {any}
     */
    PersistableModel.prototype.getPropertyValue = function (property, editing) {
        if (editing) {
            return this.__edited[property] !== undefined ? this.__edited[property] : this[property];
        }
        else {
            return this[property];
        }
    };
    /**
     * get properties
     * @param stringify
     */
    PersistableModel.prototype.getProperties = function (stringify) {
        var properties = {}, self = this;
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
     * @param stringify
     */
    PersistableModel.prototype.getPropertiesKeys = function () {
        var keys = [], self = this;
        Object.keys(self).forEach(function (property) {
            if (property.substr(0, 1) !== '_' && property.substr(0, 5) !== 'tmp__') {
                keys.push(property);
            }
        });
        return keys;
    };
    /**
     * get properties
     * @param stringify
     */
    PersistableModel.prototype.convertListPropertiesFromArrayToObject = function () {
        var self = this;
        self.getPropertiesKeys().forEach(function (property) {
            if (self.getMetadataValue(property, 'isList', null, 'usePropertyAsUuid')) {
                var tmp_1 = {}, usePropertyAsUuid_1 = self.getMetadataValue(property, 'isList', null, 'usePropertyAsUuid');
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
     * @param property
     * @param data (json object, persistable model or array of those
     * @param uuid string
     * @returns {PersistableModel} | null
     */
    PersistableModel.prototype.add = function (property, data, uuid) {
        var self = this, model = self;
        if (model.getMetadataValue(property, 'isList')) {
            var toAddModels = [];
            var toCreateModels = [];
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
                    var d = [];
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
                if (typeof d == 'object' && d.length == 1 && d[0] !== undefined) {
                    d = d[0];
                }
                var n = null;
                if (model.isInBackendMode()) {
                    // backend mode
                    var constructor = typeof model.getMetadataValue(property, 'isList') == 'function' ? model.getMetadataValue(property, 'isList') : global[model.getMetadataValue(property, 'isList')];
                    n = new constructor();
                    if (uuid !== undefined) {
                        n.setUuid(uuid);
                    }
                    else {
                        n.setUuid(angular2_uuid_1.UUID.UUID());
                    }
                    if (d !== undefined) {
                        n.loadJson(d);
                    }
                }
                else {
                    n = model.createNewLazyLoadedPersistableModel(model.getAppsAppModuleProvider(), model.getMetadataValue(property, 'isList'), uuid, d);
                    var usePropertyAsUuid = model.getMetadataValue(property, 'isList', null, 'usePropertyAsUuid');
                    if (usePropertyAsUuid) {
                        n.watch(usePropertyAsUuid, function (uuid) {
                            if (uuid && typeof uuid == 'string' && uuid.length) {
                                n.setUuid(uuid);
                                model.refreshListArray(property);
                            }
                        });
                    }
                    if (model.__isAutosave) {
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
            var t = model.getPropertyValue(property);
            if (!t || typeof t == 'undefined') {
                t = [];
            }
            toAddModels.forEach(function (d) {
                t.push(d);
            });
            model.refreshListArray(property, t);
            return t.length == 1 ? t[0] : t;
        }
        else {
            return null;
        }
    };
    /**
     * remove a new list entry
     * @param property
     * @param uuidOrObject string or array set of string or PersistableModel or array set of PersistableModel
     * @returns this
     */
    PersistableModel.prototype.remove = function (property, uuidOrObject) {
        if (this.getMetadataValue(property, 'isList')) {
            var toRemoveUuids = {};
            var afterRemovedValue = [];
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
        return this;
    };
    /**
     * clear list entry
     * @returns this
     */
    PersistableModel.prototype.clear = function (property) {
        if (this.getMetadataValue(property, 'isList')) {
            this[property] = this.transformTypeFromMetadata(property, []);
        }
        return this;
    };
    /**
     * return string representative from given property value
     * @param property
     * @param {boolean} get value is in editing mode
     * @returns {any}
     */
    PersistableModel.prototype.__toString = function (property) {
        if (property === undefined) {
            return this.serialize();
        }
        var s = null, self = this;
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
     * @param persistenceManager
     * @returns {PersistableModel}
     */
    PersistableModel.prototype.setPersistenceManager = function (persistenceManager) {
        if (persistenceManager !== undefined) {
            this.__persistenceManager = persistenceManager;
        }
        if (this.__uuid.length == 0) {
            this.__uuid = angular2_uuid_1.UUID.UUID();
        }
        return this;
    };
    /**
     * valid this object
     * @param {boolean} softcheck
     * @returns {Promise<any>}
     */
    PersistableModel.prototype.validate = function (softcheck) {
        var self = this;
        return new Promise(function (resolve, reject) {
            self.removeConditionProperties();
            class_validator_1.validate(self, { skipMissingProperties: true }).then(function (errors) {
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
     * @returns {PersistableModel}
     */
    PersistableModel.prototype.removeConditionProperties = function () {
        var self = this;
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
     * @param {string} property
     * @return {boolean}
     */
    PersistableModel.prototype.getValidation = function (property) {
        var self = this;
        if (self.__validator[property] === undefined) {
            self.__validator[property] = new rxjs_1.Observable(function (observer) {
                self.__validatorObserver[property] = observer;
            });
        }
        return self.__validator[property];
    };
    /**
     * get condition observable for given property
     * @param property
     * @returns {Observable}
     */
    PersistableModel.prototype.getCondition = function (property) {
        var _this = this;
        if (this.__conditionActionIfMatches[property] == undefined) {
            if (Object.keys(this.__conditionActionIfMatches).length) {
                this.registerConditionValidators(true);
            }
            if (this.__conditionActionIfMatches[property] === undefined) {
                this.__conditionActionIfMatches[property] = new rxjs_1.Observable(function (observer) {
                    _this.__conditionActionIfMatchesObserver[property] = observer;
                });
            }
        }
        return this.__conditionActionIfMatches[property];
    };
    /**
     * is the object/property on editing state
     * @param {string} property as an optional argument
     * @returns {boolean}
     */
    PersistableModel.prototype.hasChanges = function (property) {
        if (property) {
            return !(this.__edited[property] === undefined);
        }
        else {
            return (Object.keys(this.__edited).length);
        }
    };
    /**
     * load json data
     * @param {object|string} stringified or real json object
     * @param clone boolean
     * @returns {PersistableModel}
     */
    PersistableModel.prototype.loadJson = function (json, clone) {
        var self = this;
        json = typeof json == 'string' ? JSON.parse(json) : json;
        var model = class_transformer_1.plainToClass(this.constructor, json, { excludePrefixes: ["__"] });
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
                        // if ((self.isInBackendMode() || self.__edited[property] === undefined || self.__edited[property] === null)) {
                        self.setProperty(property, model.transformTypeFromMetadata(property, model[property]));
                        // }
                    }
                });
                self.refreshAllListArrays();
                // self.validate().then((success) => {
                //     self.emit();
                //     resolve(self);
                // }).catch((error) => {
                //     Object.keys(error).forEach((e: any) => {
                //         self['__validationErrors'][e.property] = true;
                //     });
                //     resolve(self);
                // });
            }
        }
        return self;
    };
    /**
     * transform type from metadata to avoid non matching data types
     * @param property
     * @param value
     * @returns {any}
     */
    PersistableModel.prototype.transformTypeFromMetadata = function (property, value) {
        return this.transformTypeFromMetadataExecute(property, value);
    };
    /**
     * transform type from metadata to avoid non matching data types
     * @param property
     * @param value
     * @returns {any}
     */
    PersistableModel.prototype.transformTypeFromMetadataExecute = function (property, value) {
        var self = this;
        if (this.getMetadata(property, 'isTime').length) {
            return typeof value == 'string' ? new Date(value) : (value ? value : new Date());
        }
        if (this.getMetadata(property, 'isDate').length) {
            return value ? new Date(value) : (value ? value : new Date());
        }
        if (this.getMetadata(property, 'isInt').length) {
            var v = typeof value == 'number' ? value : parseInt(value);
            return isNaN(v) || typeof v !== 'number' ? 0 : v;
        }
        if (this.getMetadata(property, 'isNumber').length) {
            return value === undefined || typeof value !== 'number' ? 0 : value;
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
            var valueAsObjects_1 = [];
            if (value && typeof value.forEach !== 'function') {
                var tmp = [];
                Object.keys(value).forEach(function (v) {
                    tmp.push(value[v]);
                });
                value = tmp;
            }
            if (value && value.length) {
                value.forEach(function (itemOriginal) {
                    if (itemOriginal !== undefined && itemOriginal.__isPersistableModel === undefined) {
                        var uuid = itemOriginal[self.getMetadataValue(property, 'isList', null, 'usePropertyAsUuid')];
                        var item = null;
                        if (!self.isInBackendMode() && self.getAppsAppModuleProvider()) {
                            item = self.createNewLazyLoadedPersistableModel(self.getAppsAppModuleProvider(), self.getMetadataValue(property, 'isList'), uuid);
                        }
                        else {
                            // backend mode
                            var constructor = typeof self.getMetadataValue(property, 'isList') == 'function' ? self.getMetadataValue(property, 'isList') : global[self.getMetadataValue(property, 'isList')];
                            item = new constructor();
                            item.setUuid(uuid);
                        }
                        if (item !== undefined) {
                            var itemLoaded = item.loadJson(itemOriginal);
                            if (!item.isInBackendMode()) {
                                itemLoaded.getChangesObserverable().subscribe(function (next) {
                                    if (next.model.getParent()) {
                                        next.model.getParent().setProperty(property, self.getPropertyValue(property, true));
                                    }
                                });
                            }
                            valueAsObjects_1.push(itemLoaded.transformAllProperties());
                            //valueAsObjects.push(item);
                            itemLoaded.refreshAllListArrays();
                            itemLoaded.setParent(self);
                        }
                    }
                    else {
                        valueAsObjects_1.push(itemOriginal);
                    }
                });
            }
            this.refreshListArray(property);
            return valueAsObjects_1;
        }
        if (this.getMetadata(property, 'isSelect').length) {
            if (this.isInBackendMode()) {
                var values = typeof value == 'object' ? value : [];
                var realValues_1 = [];
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
        return value;
    };
    /**
     * Transform all properties
     * @returns {PersistableModel}
     */
    PersistableModel.prototype.transformAllProperties = function () {
        var self = this;
        self.getPropertiesKeys().forEach(function (property) {
            self[property] = self.transformTypeFromMetadata(property, self.getPropertyValue(property));
        });
        return this;
    };
    /**
     * Transform all properties by given type
     * @param type string
     * @returns {PersistableModel}
     */
    PersistableModel.prototype.transformAllPropertiesByType = function (type) {
        var _this = this;
        var self = this;
        self.getPropertiesKeys().forEach(function (property) {
            if (_this.getMetadata(property, type).length) {
                self[property] = self.transformTypeFromMetadata(property, self[property]);
            }
        });
        return this;
    };
    /**
     * has model pending changes that are not synchronised yet or not
     * @returns {boolean}
     */
    PersistableModel.prototype.hasPendingChanges = function () {
        return this._hasPendingChanges;
    };
    /**
     * set pending changes state
     * @param {boolean} state
     * @param {any} action as an optional argument
     * @returns {PersistableModel}
     */
    PersistableModel.prototype.setHasPendingChanges = function (state, action) {
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
     * @param {boolean} noUnderScoreData
     * @param {boolean} force returning as an real object, otherwise return stringified object
     * @returns {any}
     */
    PersistableModel.prototype.serialize = function (noUnderScoreData, asObject) {
        var json = '';
        if (noUnderScoreData || noUnderScoreData === undefined) {
            json = class_transformer_1.serialize(this, { excludePrefixes: ["__", "_"] });
        }
        else {
            json = class_transformer_1.serialize(this, { excludePrefixes: ["__"] });
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
     * @returns {PersistenceManager}
     */
    PersistableModel.prototype.getPersistenceManager = function () {
        return this.__persistenceManager;
    };
    /**
     * check if current network state is online
     * @returns {boolean}
     */
    PersistableModel.prototype.isOnline = function () {
        return this.__isOnline;
    };
    /**
     * set if model is connected to internet
     * @param state
     */
    PersistableModel.prototype.setIsOnline = function (state) {
        this.__isOnline = state;
        return this;
    };
    /**
     * get properties metatadata
     * @param {string} property
     * @param {string} type
     * @returns {Array}
     */
    PersistableModel.prototype.getMetadata = function (property, type) {
        if (this.__metadataCache[property + '__' + (type === undefined ? '' : type)] === undefined) {
            var validationMetadata_1 = [];
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
     * @param property
     * @returns {boolean}
     */
    PersistableModel.prototype.isArray = function (property) {
        return typeof this[property] == 'object' ? (this[property] !== null && typeof this[property].length == 'number' ? true : false) : false;
    };
    /**
     * get metadata contraints value
     * @param property
     * @param type
     * @param metadata
     * @param string constraints
     * @returns {any}
     */
    PersistableModel.prototype.getMetadataValue = function (property, type, metadataInput, constraints) {
        var metadata = null;
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
     * @param {string} property
     * @returns {any}
     */
    PersistableModel.prototype.getType = function (property) {
        var type = null;
        var typeMappings = {
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
     * @param {boolean} prepare
     * @returns {PersistableModel}
     */
    PersistableModel.prototype.registerConditionValidators = function (prepare) {
        var self = this;
        self.__conditionBindings = { 'request': {}, 'properties': {} };
        var registerCondition = function (validator, customProperty) {
            var hasRealtimeTypes = false;
            var customPropertyName = customProperty == undefined ? validator.propertyName : customProperty;
            if (customPropertyName == validator.propertyName) {
                self.__conditionActionIfMatchesRemovedProperties[validator.propertyName] = true;
            }
            if (self.__conditionActionIfMatches[customPropertyName] == undefined) {
                self.__conditionActionIfMatches[customPropertyName] = new rxjs_1.Observable(function (observer) {
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
    PersistableModel.prototype.calculateCircularCondition = function (property, chain, counter) {
        var self = this;
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
     * @param property
     * @returns {PersistableModel}
     */
    PersistableModel.prototype.executeConditionValidatorCircular = function (property) {
        var self = this;
        var circularChain = {}, counter = 0;
        var obj = self.calculateCircularCondition(property, circularChain, counter);
        var keys = Object.keys(obj);
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
     * @param property
     * @returns {PersistableModel}
     */
    PersistableModel.prototype.executeConditionValidator = function (property) {
        var self = this;
        if (self.__conditionContraintsProperties[property] !== undefined) {
            if (self.__conditionBindings['properties'][property] !== undefined) {
                self.__conditionBindings['properties'][property].set(self.__conditionContraintsPropertiesValue[property]);
            }
        }
        var result = class_validator_1.validateSync(self, { groups: ["condition_" + property] });
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
                var result = [];
                if (affectedProperty.substr(0, 12) == '__isHidden__') {
                    result = class_validator_1.validateSync(self, { groups: [affectedProperty] });
                }
                else {
                    result = class_validator_1.validateSync(self, { groups: ["condition_" + affectedProperty] });
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
     * @param property
     * @returns {PersistableModel}
     */
    PersistableModel.prototype.recoverMissingProperty = function (property) {
        if (Object.keys(this).indexOf(property) == -1) {
            if (this.__temp[property] == undefined) {
                var tmpmodel = class_transformer_1.plainToClass(this.constructor, {}, { excludePrefixes: ["__"] });
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
     * @param notificationProvider
     * @returns {PersistableModel}
     */
    PersistableModel.prototype.setNotificationProvider = function (notificationProvider) {
        this.__notificationProvider = notificationProvider;
        return this;
    };
    /**
     *
     * @param promise
     * @returns {PersistableModel}
     */
    PersistableModel.prototype.setIsLoadedPromise = function (promise) {
        var self = this;
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
     * @returns {Promise<any>}
     */
    PersistableModel.prototype.getIsLoadedPromise = function () {
        return this.__isLoadedPromise;
    };
    /**
     * Is loaded promise
     * @returns {Promise}
     */
    PersistableModel.prototype.loaded = function () {
        var self = this;
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
     * @param message
     * @param error
     * @returns {PersistableModel}
     */
    PersistableModel.prototype.notify = function (message, error) {
        if (this.__notificationProvider !== undefined && this.__notificationProvider) {
            this.__notificationProvider(message, error);
        }
        return this;
    };
    /**
     * Get hased values
     * @Returns object
     */
    PersistableModel.prototype.getHashedValues = function () {
        var values = [];
        var self = this;
        Object.keys(this.tmp__hashedValues).forEach(function (hash) {
            values.push({ value: self.tmp__hashedValues[hash], hash: hash });
        });
        return values;
    };
    /**
     * Set hased values
     * @Returns mixed
     */
    PersistableModel.prototype.addHashedValue = function (value, hash) {
        this.tmp__hashedValues[hash] = value;
        return this;
    };
    /**
     * Get value from hashed value
     * @param string hash
     * @Returns mixed
     */
    PersistableModel.prototype.getHashedValue = function (hash) {
        var _this = this;
        if (typeof hash == 'string') {
            return this.tmp__hashedValues[hash] !== undefined ? this.tmp__hashedValues[hash] : hash;
        }
        else {
            if (typeof hash == 'object' && typeof hash.length == 'function') {
                var values_1 = [];
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
     * @param string value
     * @param hash
     * @Returns string hash
     */
    PersistableModel.prototype.setHashedValue = function (value) {
        var hash = typeof value == 'object' ? objectHash.sha1(value) : value;
        if (hash !== value) {
            this.tmp__hashedValues[hash] = value;
        }
        return hash;
    };
    /**
     * creates new lazy loaded persistable model
     * @param appsAppModuleProvider
     * @param constructor
     * @param uuid
     * @param data
     */
    PersistableModel.prototype.createNewLazyLoadedPersistableModel = function (appsAppModuleProvider, constructor, uuid, data) {
        var o = new constructor();
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
     * @param appsAppModuleProvider
     * @returns {this}
     */
    PersistableModel.prototype.setAppsAppModuleProvider = function (appsAppModuleProvider) {
        this.__appsAppModuleProvider = appsAppModuleProvider;
        return this;
    };
    /**
     * set appsAppModuleProvider
     * @returns {any}
     */
    PersistableModel.prototype.getAppsAppModuleProvider = function () {
        return this.__appsAppModuleProvider;
    };
    /**
     * set parent model
     * @param parentModel
     * @returns {this}
     */
    PersistableModel.prototype.setParent = function (parentModel) {
        this.__parent = parentModel;
        return this;
    };
    /**
     * get parent model
     * @returns {any}
     */
    PersistableModel.prototype.getParent = function () {
        return this.__parent;
    };
    /**
     * get changes observerable
     * @returns {Observable<any>}
     */
    PersistableModel.prototype.getChangesObserverable = function () {
        return this.__editedObservable;
    };
    /**
     * execute changes with callback
     * @param event
     * @returns {this}
     */
    PersistableModel.prototype.executeChangesWithCallback = function (event) {
        this.__editedObservableCallbacks.forEach(function (callback) {
            callback(event);
        });
        return this;
    };
    /**
     * observe property
     * @param property
     * @param any callback
     * @returns {this}
     */
    PersistableModel.prototype.watch = function (property, callback) {
        var lastValue = null;
        try {
            lastValue = objectHash.sha1(this[property]);
        }
        catch (e) {
            lastValue = this[property];
        }
        callback(this[property]);
        this.__editedObservableObservers.push({ callback: callback, property: property, lastValue: lastValue });
        return this;
    };
    /**
     * get changes with callback
     * @returns {this}
     */
    PersistableModel.prototype.getChangesWithCallback = function (callback) {
        this.__editedObservableCallbacks.push(callback);
        return this;
    };
    /**
     * Check if model is initialized in backend mode
     * @returns {boolean}
     */
    PersistableModel.prototype.isInBackendMode = function () {
        return global[this.constructor.name] === undefined && global['appsapp-backend-mode'] === undefined ? false : true;
    };
    /**
     * Enable autosave mode
     * @returns {this}
     */
    PersistableModel.prototype.autosave = function () {
        this.__isAutosave = true;
        return this;
    };
    /**
     * check if model has errors or not
     * @returns {boolean}
     */
    PersistableModel.prototype.isValid = function () {
        return Object.keys(this.__validationErrors).length ? false : true;
    };
    /**
     * create list array
     * @param property
     * @returns {any}
     */
    PersistableModel.prototype.createListArray = function (property, reset) {
        var self = this;
        if (reset !== undefined) {
            try {
                delete this.__listArrays[property];
            }
            catch (e) {
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
     * @param property
     * @param property
     * @returns {any}
     */
    PersistableModel.prototype.refreshListArray = function (property, value) {
        if (this.getMetadataValue(property, 'isList')) {
            var properties_1 = {}, v = value == undefined ? this.getPropertyValue(property) : value;
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
     * @param stringify
     */
    PersistableModel.prototype.refreshAllListArrays = function () {
        var _this = this;
        var self = this;
        self.getPropertiesKeys().forEach(function (property) {
            if (self.getMetadataValue(property, 'isList', null, 'usePropertyAsUuid')) {
                _this.refreshListArray(property);
            }
        });
        return this;
    };
    return PersistableModel;
}());
exports.PersistableModel = PersistableModel;
