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
        this.__forceUpdateProperty = {};
        this.__isOnline = true;
        this.__validationErrors = {};
        this.__metadata = [];
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
        this.__metadata = class_validator_2.getFromContainer(class_validator_3.MetadataStorage).getTargetValidationMetadatas(this.constructor, '');
        // check if all loaded metadata has corresponding properties
        this.__metadata.forEach(function (metadata) {
            if (_this[metadata.propertyName] == undefined) {
                _this[metadata.propertyName] = null;
            }
        });
        this.__init();
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
     * update property
     * @param property
     * @param value
     */
    PersistableModel.prototype.update = function (property, value) {
        var observer = this.setProperty(property, value).setHasNoChanges(property).getPropertyObserver(property);
        if (observer) {
            observer.next(value);
        }
        try {
            delete this.__bindings[property];
        }
        catch (e) {
            // e
        }
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
     * @param boolean silent
     * @returns {Observable<any>}
     */
    PersistableModel.prototype.trigger = function (action) {
        var self = this;
        return new rxjs_1.Observable(function (observer) {
            if (self.__isLoaded) {
                self.getPersistenceManager().trigger(self, observer, {
                    name: 'custom',
                    data: {
                        name: action
                    }
                });
            }
            else {
                self.loaded().then(function (model) {
                    self.getPersistenceManager().trigger(model, observer, {
                        name: 'custom',
                        data: {
                            name: action
                        }
                    });
                });
            }
        });
    };
    /**
     * save with optional observable
     * @param action
     * @param silent
     * @returns {Observable<any>}
     */
    PersistableModel.prototype.save = function (action, silent) {
        var self = this, observer = null;
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
            else {
                if (!silent) {
                    self.notify(next);
                }
            }
        }, function (error) {
            if (observer) {
                observer.error(error);
            }
            else {
                if (!silent) {
                    self.notify(error, true);
                }
            }
        }, function () {
            if (observer) {
                observer.complete();
            }
            else {
                if (!silent) {
                    self.notify(self.getMessage('done'));
                }
            }
        });
        return new rxjs_1.Observable(function (o) {
            observer = o;
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
     * @returns {PersistableModel}
     */
    PersistableModel.prototype.reset = function () {
        var self = this;
        Object.keys(self.getProperties()).forEach(function (property) {
            self.update(property, self.transformTypeFromMetadata(property, ''));
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
     * get firebase data from base path /object/uuid/..
     * @param string path
     * @returns Promise
     */
    PersistableModel.prototype.getFirebaseData = function (path) {
        if (this.getFirebaseDatabase()) {
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
            var p = this.__firebaseDatabaseRoot + '/' + this.getFirebaseDatabasePath().substr(this.__firebaseDatabaseRoot.length + 1).split("/")[0] + '/' + this.getFirebaseDatabasePath().substr(this.__firebaseDatabaseRoot.length + 1).split("/")[1] + path.substr(1);
            return this.getFirebaseDatabase().object(p).query.once('value');
        }
        else {
            return new Promise(function (resolve, reject) {
                resolve(null);
            });
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
                window.setTimeout(function () {
                    if (self.__bindingsObserver[property] !== undefined) {
                        self.__bindingsObserver[property].next(self[property]);
                    }
                });
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
                callback.callback(value);
                callback.first = true;
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
            this.save(null, true);
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
            return this.__edited[property] ? this.__edited[property] : this[property];
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
     * @param stringify
     */
    PersistableModel.prototype.convertListPropertiesFromArrayToObject = function () {
        var self = this;
        Object.keys(self).forEach(function (property) {
            if (property.substr(0, 1) !== '_' && self.getMetadataValue(property, 'isList', null, 'usePropertyAsUuid')) {
                var tmp_1 = {}, usePropertyAsUuid_1 = self.getMetadataValue(property, 'isList', null, 'usePropertyAsUuid');
                if (usePropertyAsUuid_1 && usePropertyAsUuid_1 !== undefined && usePropertyAsUuid_1 !== true) {
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
     * @returns this
     */
    PersistableModel.prototype.add = function (property, data, uuid) {
        var _this = this;
        var self = this;
        if (this.getMetadataValue(property, 'isList')) {
            var toAddModels = [];
            var toCreateModels = [];
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
                    uuid = d !== undefined ? d[self.getMetadataValue(property, 'isList', null, 'usePropertyAsUuid')] : null;
                }
                if (typeof d == 'object' && d.length == 1 && d[0] !== undefined) {
                    d = d[0];
                }
                var n = null;
                if (self.__appsAppModuleProvider === undefined) {
                    // backend mode
                    var constructor = self.getMetadataValue(property, 'isList');
                    n = new constructor();
                    if (uuid !== undefined) {
                        n.setUuid(uuid);
                        if (d !== undefined) {
                            n.loadJson(d);
                        }
                    }
                }
                else {
                    n = self.__appsAppModuleProvider.new(self.getMetadataValue(property, 'isList'), uuid, d);
                    if (self.__isAutosave) {
                        n.autosave();
                    }
                }
                toAddModels.push(n);
                // force conditions to be calculated initially
                if (!n.isInBackendMode()) {
                    window.setTimeout(function () {
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
                    }, 1);
                }
            });
            var t = this.getPropertyValue(property);
            console.log(t, toAddModels);
            toAddModels.forEach(function (n) {
                t.push(n);
            });
            return this.setProperty(property, t);
        }
        else {
            return this;
        }
    };
    /**
     * remove a new list entry
     * @param property
     * @param uuid string or array set of string
     * @returns this
     */
    PersistableModel.prototype.remove = function (property, uuid) {
        if (this.getMetadataValue(property, 'isList') && this.__appsAppModuleProvider) {
            var toRemoveUuids = {};
            var afterRemovedValue = [];
            if (typeof uuid === 'string') {
                toRemoveUuids[uuid] = true;
            }
            else {
                uuid.forEach(function (id) {
                    toRemoveUuids[id] = true;
                });
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
     * remove changes state
     * @param {string} property as an optional argument
     * @returns {boolean}
     */
    PersistableModel.prototype.setHasNoChanges = function (property) {
        if (property) {
            this.__forceUpdateProperty[property] = true;
            if (this.__edited[property]) {
                try {
                    delete this.__edited[property];
                }
                catch (e) {
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
     * @param {propertiesAsObject}
     * @returns {Promise<any>}
     */
    PersistableModel.prototype.importDynamicProperties = function (propertiesAsObject) {
        var self = this;
        return new Promise(function (resolve, reject) {
            Object.keys(propertiesAsObject).forEach(function (property) {
                self[property] = self.transformTypeFromMetadata(property, propertiesAsObject[property]);
            });
            resolve(self);
        });
    };
    /**
     * load json data
     * @param {object|string} stringified or real json object
     * @returns {Promise<any>}
     */
    PersistableModel.prototype.loadJson = function (json) {
        var self = this;
        json = typeof json == 'string' ? JSON.parse(json) : json;
        var model = class_transformer_1.plainToClass(this.constructor, json, { excludePrefixes: ["__"] });
        return new Promise(function (resolve, reject) {
            if (model) {
                var propertiesWithValidationError_1 = {};
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
                            self.setProperty(property, self.transformTypeFromMetadata(property, model[property]));
                            if (model.isInBackendMode()) {
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
     * @param property
     * @param value
     * @returns {any}
     */
    PersistableModel.prototype.transformTypeFromMetadata = function (property, value) {
        var self = this;
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
            var valueAsObjects_1 = [];
            if (value.length) {
                value.forEach(function (itemOriginal) {
                    if (itemOriginal instanceof PersistableModel == false) {
                        var uuid = itemOriginal[self.getMetadataValue(property, 'isList', null, 'usePropertyAsUuid')];
                        var item_1 = null;
                        if (self.getAppsAppModuleProvider() !== undefined) {
                            item_1 = self.getAppsAppModuleProvider().new(self.getMetadataValue(property, 'isList'), uuid);
                        }
                        else {
                            // backend mode
                            var constructor = self.getMetadataValue(property, 'isList');
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
            var values = typeof value == 'object' ? value : [];
            var realValues_1 = [];
            if (values.length) {
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
     * @returns {PersistableModel}
     */
    PersistableModel.prototype.transformAllProperties = function () {
        var self = this;
        Object.keys(self).forEach(function (property) {
            if (property.substr(0, 1) !== '_') {
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
        var validationMetadata = [];
        this.__metadata.forEach(function (metadata) {
            if (!property || metadata.propertyName == property) {
                if (!type || metadata.type == type || (metadata.type == 'customValidation' && metadata.constraints && metadata.constraints[0].type == type)) {
                    validationMetadata.push(metadata);
                }
            }
        });
        return validationMetadata;
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
            'isNumpad': 'number',
            'customValidation': function (metadata) {
                if (metadata.constraints[0].type && metadata.constraints[0].type && metadata.constraints[0].type.substr(0, 3) !== 'has') {
                    return typeMappings[metadata.constraints[0].type] !== undefined ? typeMappings[metadata.constraints[0].type] : metadata.constraints[0].type;
                }
                return null;
            }
        };
        this.getMetadata(property).forEach(function (metadata) {
            if (type == null && typeMappings[metadata.type] !== undefined) {
                if (typeof typeMappings[metadata.type] == 'string') {
                    type = typeMappings[metadata.type];
                }
                else if (typeof typeMappings[metadata.type] == 'function') {
                    type = typeMappings[metadata.type](metadata);
                }
            }
        });
        if (!type) {
            type = typeMappings[typeof this[property]] !== undefined ? typeMappings[typeof this[property]] : null;
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
        this.getMetadata(null, 'hasConditions').forEach(function (validator) {
            var hasRealtimeTypes = false;
            self.__conditionActionIfMatchesRemovedProperties[validator.propertyName] = true;
            if (self.__conditionActionIfMatches[validator.propertyName] == undefined) {
                self.__conditionActionIfMatches[validator.propertyName] = new rxjs_1.Observable(function (observer) {
                    self.__conditionActionIfMatchesObserver[validator.propertyName] = observer;
                    self.__conditionActionIfMatchesObserver[validator.propertyName].next({
                        'action': self.__conditionActionIfMatchesAction[validator.propertyName],
                        'state': true
                    });
                });
                // self.__conditionActionIfMatches[validator.propertyName].subscribe(() => {
                // });
                // self.__conditionActionIfMatches[validator.propertyName].share();
                //
            }
            if (!prepare) {
                if (self.__conditionActionIfMatchesObserver && self.__conditionActionIfMatchesAction[validator.propertyName] === undefined && self.__conditionActionIfMatchesObserver[validator.propertyName]) {
                    self.__conditionActionIfMatchesAction[validator.propertyName] = validator.constraints[0].actionIfMatches;
                    self.__conditionActionIfMatchesObserver[validator.propertyName].next({
                        'action': self.__conditionActionIfMatchesAction[validator.propertyName],
                        'state': true
                    });
                }
                validator.constraints[0].value.forEach(function (v) {
                    if (v.type == 'limit') {
                        hasRealtimeTypes = true;
                    }
                    if (self.__conditionContraintsProperties[v.property] === undefined) {
                        self.__conditionContraintsProperties[v.property] = {};
                    }
                    self.__conditionContraintsProperties[v.property][v.type] = true;
                    if (self.__conditionContraintsAffectedProperties[v.property] === undefined) {
                        self.__conditionContraintsAffectedProperties[v.property] = {};
                    }
                    self.__conditionContraintsAffectedProperties[v.property][validator.propertyName] = true;
                });
                if (hasRealtimeTypes) {
                    self.__conditionBindings['request'][validator.propertyName] = self.getFirebaseDatabase().object(self.getFirebaseDatabasePath() + "/condition/request/" + validator.propertyName);
                    self.__conditionBindings['request'][validator.propertyName].set(validator.constraints[0].value);
                }
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
                var result = class_validator_1.validateSync(self, { groups: ["condition_" + affectedProperty] });
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
            self.__isLoaded = true;
        });
        return this;
    };
    /**
     * Is loaded promise
     * @returns {Promise}
     */
    PersistableModel.prototype.loaded = function () {
        var self = this;
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
     * @param message
     * @param error
     * @returns {PersistableModel}
     */
    PersistableModel.prototype.notify = function (message, error) {
        this.__notificationProvider(message, error);
        return this;
    };
    /**
     * Get hased values
     * @Returns object
     */
    PersistableModel.prototype.getHashedValues = function () {
        var values = [];
        var self = this;
        Object.keys(this.__hashedValues).forEach(function (hash) {
            values.push({ value: self.__hashedValues[hash], hash: hash });
        });
        return values;
    };
    /**
     * Set hased values
     * @Returns mixed
     */
    PersistableModel.prototype.addHashedValue = function (value, hash) {
        this.__hashedValues[hash] = value;
        return this;
    };
    /**
     * Get value from hashed value
     * @param string hash
     * @Returns mixed
     */
    PersistableModel.prototype.getHashedValue = function (hash) {
        return this.__hashedValues[hash] !== undefined ? this.__hashedValues[hash] : hash;
    };
    /**
     * Set hashed value
     * @param string value
     * @param hash
     * @Returns string hash
     */
    PersistableModel.prototype.setHashedValue = function (value) {
        var hash = typeof value == 'object' ? objectHash.sha1(value) : value;
        this.__hashedValues[hash] = value;
        return hash;
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
        var self = this;
        this.__editedObservableObservers.push({ callback: callback, property: property });
        callback(this.getPropertyValue(property));
        this.loaded().then(function (model) {
            callback(model.getPropertyValue(property));
        });
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
        return global[this.constructor.name] === undefined ? false : true;
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
    return PersistableModel;
}());
exports.PersistableModel = PersistableModel;
