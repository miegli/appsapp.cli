import { MetadataStorage, Validator, getFromContainer, registerDecorator, validate, validateSync } from 'class-validator';
import { plainToClass, serialize } from 'class-transformer';
import { UUID } from 'angular2-uuid';
import { sha1 } from 'object-hash';
import { Observable } from 'rxjs';
import { get } from 'unirest';


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
        this.__metadata = getFromContainer(MetadataStorage).getTargetValidationMetadatas(this.constructor, '');
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
     * @return {?}
     */
    PersistableModel.prototype.__init = function () {
        var _this = this;
        var /** @type {?} */ self = this;
        /**
         * create observerable and observer for handling the models data changes
         */
        this.__editedObservable = new Observable(function (observer) {
            self.__editedObserver = observer;
        });
        /**
         * create observerable and observer for handling the models data changes
         */
        this.__observable = new Observable(function (observer) {
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
    PersistableModel.prototype.getHttpClient = function () {
        return this.__httpClient;
    };
    /**
     * set http client
     * @param {?} http
     * @return {?}
     */
    PersistableModel.prototype.setHttpClient = function (http) {
        this.__httpClient = http;
        return this;
    };
    /**
     * update property
     * @param {?} property
     * @param {?} value
     * @return {?}
     */
    PersistableModel.prototype.update = function (property, value) {
        var /** @type {?} */ observer = this.setProperty(property, value).setHasNoChanges(property).getPropertyObserver(property);
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
     * @return {?}
     */
    PersistableModel.prototype.emit = function () {
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
    PersistableModel.prototype.saveWithPromise = function (action) {
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
    PersistableModel.prototype.action = function (action) {
        var /** @type {?} */ self = this;
        var /** @type {?} */ observable = new Observable(function (observer) {
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
     * @return {?}
     */
    PersistableModel.prototype.trigger = function (action) {
        var /** @type {?} */ self = this;
        return new Observable(function (observer) {
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
     * @param {?=} action
     * @param {?=} silent
     * @return {?}
     */
    PersistableModel.prototype.save = function (action, silent) {
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
        return new Observable(function (o) {
            observer = o;
        });
    };
    /**
     * save model and persist if is persistable
     * @param {?=} action
     * @return {?}
     */
    PersistableModel.prototype.executeSave = function (action) {
        var /** @type {?} */ self = this;
        Object.keys(self.__edited).forEach(function (property) {
            self[property] = self.__edited[property];
        });
        return new Observable(function (observer) {
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
    PersistableModel.prototype.reset = function () {
        var /** @type {?} */ self = this;
        Object.keys(self.getProperties()).forEach(function (property) {
            self.update(property, self.transformTypeFromMetadata(property, ''));
        });
        self.__edited = {};
        return this;
    };
    /**
     * removes edited states
     * @return {?}
     */
    PersistableModel.prototype.removeEditedState = function () {
        this.__edited = {};
        return this;
    };
    /**
     * get models observer
     * @return {?}
     */
    PersistableModel.prototype.getObserver = function () {
        return this.__observer;
    };
    /**
     * get models obervable
     * @return {?}
     */
    PersistableModel.prototype.getObservable = function () {
        return this.__observable;
    };
    /**
     * set uuid
     * @param {?=} uuid
     * @return {?}
     */
    PersistableModel.prototype.setUuid = function (uuid) {
        this.__uuid = uuid !== undefined ? uuid : UUID.UUID();
        return this;
    };
    /**
     * get uuid
     * @return {?}
     */
    PersistableModel.prototype.getUuid = function () {
        return this.__uuid;
    };
    /**
     * get models constructors name as an object identifier
     * return {string}
     * @return {?}
     */
    PersistableModel.prototype.getObjectIdentifier = function () {
        return this.constructor.name;
    };
    /**
     * set firebaseDatabase
     * @param {?} firebaseDatabase
     * @return {?}
     */
    PersistableModel.prototype.setFirebaseDatabase = function (firebaseDatabase) {
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
    PersistableModel.prototype.getFirebaseDatabase = function () {
        return this.__firebaseDatabase;
    };
    /**
     * set firebase database path
     * @param {?} path
     * @return {?}
     */
    PersistableModel.prototype.setFirebaseDatabasePath = function (path) {
        this.__firebaseDatabasePath = path;
        this.registerConditionValidators(false);
        return this;
    };
    /**
     * get firebase database path
     * @return {?}
     */
    PersistableModel.prototype.getFirebaseDatabasePath = function () {
        return this.__firebaseDatabasePath;
    };
    /**
     * set firebaseDatabaseObject
     * @param {?} firebaseDatabaseObject
     * @return {?}
     */
    PersistableModel.prototype.setFirebaseDatabaseObject = function (firebaseDatabaseObject) {
        this.__angularFireObject = firebaseDatabaseObject;
        return this;
    };
    /**
     * get firebaseDatabaseObject
     * @return {?}
     */
    PersistableModel.prototype.getFirebaseDatabaseObject = function () {
        return this.__angularFireObject;
    };
    /**
     * get firebaseDatabase prefix
     * @return {?} string
     */
    PersistableModel.prototype.getFirebaseDatabaseRoot = function () {
        return this.__firebaseDatabaseRoot;
    };
    /**
     * set firebase databse path prefix
     * @param {?} path
     * @return {?}
     */
    PersistableModel.prototype.setFirebaseDatabaseRoot = function (path) {
        this.__firebaseDatabaseRoot = path;
        return this;
    };
    /**
     * get property
     * @param {?} property
     * @return {?}
     */
    PersistableModel.prototype.getProperty = function (property) {
        var /** @type {?} */ self = this;
        if (this.isInBackendMode()) {
            return self.getPropertyValue(property);
        }
        else {
            if (!self.__bindings[property]) {
                self.__bindings[property] = new Observable(function (observer) {
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
     * @param {?} property
     * @return {?}
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
     * @param {?} messages
     * @return {?}
     */
    PersistableModel.prototype.setMessages = function (messages) {
        this.__messages = messages;
        return this;
    };
    /**
     * get modules providers message
     * @param {?} keyword
     * @return {?}
     */
    PersistableModel.prototype.getMessage = function (keyword) {
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
    PersistableModel.prototype.setProperty = function (property, value) {
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
            this.save(null, true);
        }
        return this;
    };
    /**
     * return current property value
     * @param {?} property
     * @param {?=} editing
     * @return {?}
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
     * @param {?=} stringify
     * @return {?}
     */
    PersistableModel.prototype.getProperties = function (stringify) {
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
     * add a new list entry
     * @param {?} property
     * @param {?=} data (json object, persistable model or array of those
     * @param {?=} uuid string
     * @return {?} this
     */
    PersistableModel.prototype.add = function (property, data, uuid) {
        var _this = this;
        var /** @type {?} */ self = this;
        if (this.getMetadataValue(property, 'isList') && this.__appsAppModuleProvider) {
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
                toCreateModels.push(data);
            }
            toCreateModels.forEach(function (d) {
                if (uuid === undefined || uuid === null) {
                    uuid = d[self.getMetadataValue(property, 'isList', null, 'usePropertyAsUuid')];
                }
                var /** @type {?} */ n = null;
                if (self.__appsAppModuleProvider === undefined) {
                    // backend mode
                    var /** @type {?} */ constructor = self.getMetadataValue(property, 'isList');
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
            });
            var /** @type {?} */ t = this.getPropertyValue(property);
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
     * @param {?} property
     * @param {?=} uuid string or array set of string
     * @return {?} this
     */
    PersistableModel.prototype.remove = function (property, uuid) {
        if (this.getMetadataValue(property, 'isList') && this.__appsAppModuleProvider) {
            var /** @type {?} */ toRemoveUuids = {};
            var /** @type {?} */ afterRemovedValue = [];
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
     * @param {?=} property
     * @return {?}
     */
    PersistableModel.prototype.__toString = function (property) {
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
    PersistableModel.prototype.setPersistenceManager = function (persistenceManager) {
        if (persistenceManager !== undefined) {
            this.__persistenceManager = persistenceManager;
        }
        if (this.__uuid.length == 0) {
            this.__uuid = UUID.UUID();
        }
        return this;
    };
    /**
     * valid this object
     * @param {?=} softcheck
     * @return {?}
     */
    PersistableModel.prototype.validate = function (softcheck) {
        var /** @type {?} */ self = this;
        return new Promise(function (resolve, reject) {
            self.removeConditionProperties();
            validate(self, { skipMissingProperties: true }).then(function (errors) {
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
    PersistableModel.prototype.removeConditionProperties = function () {
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
    PersistableModel.prototype.getValidation = function (property) {
        var /** @type {?} */ self = this;
        if (self.__validator[property] === undefined) {
            self.__validator[property] = new Observable(function (observer) {
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
    PersistableModel.prototype.getCondition = function (property) {
        var _this = this;
        if (this.__conditionActionIfMatches[property] == undefined) {
            if (Object.keys(this.__conditionActionIfMatches).length) {
                this.registerConditionValidators(true);
            }
            if (this.__conditionActionIfMatches[property] === undefined) {
                this.__conditionActionIfMatches[property] = new Observable(function (observer) {
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
     * @param {?=} property
     * @return {?}
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
     * @param {?} propertiesAsObject
     * @return {?}
     */
    PersistableModel.prototype.importDynamicProperties = function (propertiesAsObject) {
        var /** @type {?} */ self = this;
        return new Promise(function (resolve, reject) {
            Object.keys(propertiesAsObject).forEach(function (property) {
                self[property] = self.transformTypeFromMetadata(property, propertiesAsObject[property]);
            });
            resolve(self);
        });
    };
    /**
     * load json data
     * @param {?} json
     * @return {?}
     */
    PersistableModel.prototype.loadJson = function (json) {
        var /** @type {?} */ self = this;
        var /** @type {?} */ model = (plainToClass(/** @type {?} */ (this.constructor), typeof json == 'string' ? JSON.parse(json) : json, { excludePrefixes: ["__"] }));
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
     * @param {?} property
     * @param {?} value
     * @return {?}
     */
    PersistableModel.prototype.transformTypeFromMetadata = function (property, value) {
        var /** @type {?} */ self = this;
        if (this.getMetadata(property, 'isDate').length) {
            return value ? new Date(value) : null;
        }
        if (this.getMetadata(property, 'isCalendar').length) {
            return value ? new Date(value) : null;
        }
        if (this.getMetadata(property, 'isBirthDate').length) {
            return value ? new Date(value) : null;
        }
        if (this.getMetadata(property, 'isDateRange').length) {
            return typeof value == 'object' ? value : [];
        }
        if (this.getMetadata(property, 'isList').length) {
            var /** @type {?} */ valueAsObjects_1 = [];
            if (value.length) {
                value.forEach(function (itemOriginal) {
                    if (itemOriginal instanceof PersistableModel == false) {
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
     * @return {?}
     */
    PersistableModel.prototype.transformAllProperties = function () {
        var /** @type {?} */ self = this;
        Object.keys(self).forEach(function (property) {
            if (property.substr(0, 1) !== '_') {
                self[property] = self.transformTypeFromMetadata(property, self[property]);
            }
        });
        return this;
    };
    /**
     * has model pending changes that are not synchronised yet or not
     * @return {?}
     */
    PersistableModel.prototype.hasPendingChanges = function () {
        return this._hasPendingChanges;
    };
    /**
     * set pending changes state
     * @param {?} state
     * @param {?=} action
     * @return {?}
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
     * @param {?=} noUnderScoreData
     * @param {?=} asObject
     * @return {?}
     */
    PersistableModel.prototype.serialize = function (noUnderScoreData, asObject) {
        var /** @type {?} */ json = '';
        if (noUnderScoreData) {
            json = serialize(this, { excludePrefixes: ["__", "_"] });
        }
        else {
            json = serialize(this, { excludePrefixes: ["__"] });
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
    PersistableModel.prototype.getPersistenceManager = function () {
        return this.__persistenceManager;
    };
    /**
     * check if current network state is online
     * @return {?}
     */
    PersistableModel.prototype.isOnline = function () {
        return this.__isOnline;
    };
    /**
     * set if model is connected to internet
     * @param {?} state
     * @return {?}
     */
    PersistableModel.prototype.setIsOnline = function (state) {
        this.__isOnline = state;
        return this;
    };
    /**
     * get properties metatadata
     * @param {?=} property
     * @param {?=} type
     * @return {?}
     */
    PersistableModel.prototype.getMetadata = function (property, type) {
        var /** @type {?} */ validationMetadata = [];
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
     * @param {?} property
     * @return {?}
     */
    PersistableModel.prototype.isArray = function (property) {
        return typeof this[property] == 'object' ? (typeof this[property].length == 'number' ? true : false) : false;
    };
    /**
     * get metadata contraints value
     * @param {?=} property
     * @param {?=} type
     * @param {?=} metadataInput
     * @param {?=} constraints
     * @return {?}
     */
    PersistableModel.prototype.getMetadataValue = function (property, type, metadataInput, constraints) {
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
    PersistableModel.prototype.getType = function (property) {
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
     * @param {?} prepare
     * @return {?}
     */
    PersistableModel.prototype.registerConditionValidators = function (prepare) {
        var /** @type {?} */ self = this;
        self.__conditionBindings = { 'request': {}, 'properties': {} };
        this.getMetadata(null, 'hasConditions').forEach(function (validator) {
            var /** @type {?} */ hasRealtimeTypes = false;
            self.__conditionActionIfMatchesRemovedProperties[validator.propertyName] = true;
            if (self.__conditionActionIfMatches[validator.propertyName] == undefined) {
                self.__conditionActionIfMatches[validator.propertyName] = new Observable(function (observer) {
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
    /**
     * @param {?} property
     * @param {?} chain
     * @param {?} counter
     * @return {?}
     */
    PersistableModel.prototype.calculateCircularCondition = function (property, chain, counter) {
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
    PersistableModel.prototype.executeConditionValidatorCircular = function (property) {
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
    PersistableModel.prototype.executeConditionValidator = function (property) {
        var /** @type {?} */ self = this;
        if (self.__conditionContraintsProperties[property] !== undefined) {
            if (self.__conditionBindings['properties'][property] !== undefined) {
                self.__conditionBindings['properties'][property].set(self.__conditionContraintsPropertiesValue[property]);
            }
        }
        var /** @type {?} */ result = validateSync(self, { groups: ["condition_" + property] });
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
                var /** @type {?} */ result = validateSync(self, { groups: ["condition_" + affectedProperty] });
                self.__conditionActionIfMatchesObserver[affectedProperty].next({
                    action: self.__conditionActionIfMatchesAction[affectedProperty],
                    state: result.length ? true : false
                });
                self.recoverMissingProperty(affectedProperty);
                self.__conditionActionIfMatchesRemovedProperties[affectedProperty] = result.length ? true : false;
                if (self.__validatorObserver[affectedProperty]) {
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
    PersistableModel.prototype.recoverMissingProperty = function (property) {
        if (Object.keys(this).indexOf(property) == -1) {
            if (this.__temp[property] == undefined) {
                var /** @type {?} */ tmpmodel = (plainToClass(/** @type {?} */ (this.constructor), {}, { excludePrefixes: ["__"] }));
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
    PersistableModel.prototype.setNotificationProvider = function (notificationProvider) {
        this.__notificationProvider = notificationProvider;
        return this;
    };
    /**
     *
     * @param {?} promise
     * @return {?}
     */
    PersistableModel.prototype.setIsLoadedPromise = function (promise) {
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
    PersistableModel.prototype.loaded = function () {
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
    PersistableModel.prototype.notify = function (message, error) {
        this.__notificationProvider(message, error);
        return this;
    };
    /**
     * Get hased values
     * \@Returns object
     * @return {?}
     */
    PersistableModel.prototype.getHashedValues = function () {
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
    PersistableModel.prototype.addHashedValue = function (value, hash) {
        this.__hashedValues[hash] = value;
        return this;
    };
    /**
     * Get value from hashed value
     * \@Returns mixed
     * @param {?} hash
     * @return {?}
     */
    PersistableModel.prototype.getHashedValue = function (hash) {
        return this.__hashedValues[hash] !== undefined ? this.__hashedValues[hash] : hash;
    };
    /**
     * Set hashed value
     * \@Returns string hash
     * @param {?} value
     * @return {?}
     */
    PersistableModel.prototype.setHashedValue = function (value) {
        var /** @type {?} */ hash = typeof value == 'object' ? sha1(value) : value;
        this.__hashedValues[hash] = value;
        return hash;
    };
    /**
     * set appsAppModuleProvider
     * @param {?} appsAppModuleProvider
     * @return {?}
     */
    PersistableModel.prototype.setAppsAppModuleProvider = function (appsAppModuleProvider) {
        this.__appsAppModuleProvider = appsAppModuleProvider;
        return this;
    };
    /**
     * set appsAppModuleProvider
     * @return {?}
     */
    PersistableModel.prototype.getAppsAppModuleProvider = function () {
        return this.__appsAppModuleProvider;
    };
    /**
     * set parent model
     * @param {?} parentModel
     * @return {?}
     */
    PersistableModel.prototype.setParent = function (parentModel) {
        this.__parent = parentModel;
        return this;
    };
    /**
     * get parent model
     * @return {?}
     */
    PersistableModel.prototype.getParent = function () {
        return this.__parent;
    };
    /**
     * get changes observerable
     * @return {?}
     */
    PersistableModel.prototype.getChangesObserverable = function () {
        return this.__editedObservable;
    };
    /**
     * execute changes with callback
     * @param {?} event
     * @return {?}
     */
    PersistableModel.prototype.executeChangesWithCallback = function (event) {
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
    PersistableModel.prototype.watch = function (property, callback) {
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
    PersistableModel.prototype.getChangesWithCallback = function (callback) {
        this.__editedObservableCallbacks.push(callback);
        return this;
    };
    /**
     * Check if model is initialized in backend mode
     * @return {?}
     */
    PersistableModel.prototype.isInBackendMode = function () {
        return global[this.constructor.name] === undefined ? false : true;
    };
    /**
     * Enable autosave mode
     * @return {?}
     */
    PersistableModel.prototype.autosave = function () {
        this.__isAutosave = true;
        return this;
    };
    return PersistableModel;
}());

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
        });
        registerDecorator({
            name: "hasConditions",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'hasConditions', 'value': options, 'actionIfMatches': actionIfMatches }],
            options: { groups: ['condition_' + propertyName] },
            validator: {
                /**
                 * @param {?} value
                 * @param {?} args
                 * @return {?}
                 */
                validate: function (value, args) {
                    var /** @type {?} */ validator = new Validator();
                    var /** @type {?} */ state = true;
                    /**
                     * iterates over all rules synchronous
                     */
                    if (options) {
                        options.forEach(function (condition) {
                            if (state) {
                                if (condition.type == 'condition') {
                                    if (!validator[condition.validator](args.object.__conditionContraintsPropertiesValue[condition.property] === undefined ? args.object[condition.property] : args.object.__conditionContraintsPropertiesValue[condition.property], condition.value, condition.validatorAdditionalArgument)) {
                                        state = false;
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
                        catch (e) {
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
 * @param {?} description
 * @param {?=} validationOptions
 * @return {?}
 */
function HasDescription(description, validationOptions) {
    return function (object, propertyName) {
        registerDecorator({
            name: "hasDescription",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'hasDescription', 'value': description }],
            options: validationOptions,
            validator: {
                /**
                 * @param {?} value
                 * @param {?} args
                 * @return {?}
                 */
                validate: function (value, args) {
                    return true;
                }
            }
        });
    };
}

/**
 * @param {?} label
 * @param {?=} validationOptions
 * @return {?}
 */
function HasLabel(label, validationOptions) {
    return function (object, propertyName) {
        registerDecorator({
            name: "hasLabel",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'hasLabel', 'value': label }],
            options: validationOptions,
            validator: {
                /**
                 * @param {?} value
                 * @param {?} args
                 * @return {?}
                 */
                validate: function (value, args) {
                    return true;
                }
            }
        });
    };
}

/**
 * @param {?} precision
 * @param {?=} validationOptions
 * @return {?}
 */
function HasPrecision(precision, validationOptions) {
    return function (object, propertyName) {
        registerDecorator({
            name: "hasPrecision",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'hasPrecision', 'value': precision }],
            options: validationOptions,
            validator: {
                /**
                 * @param {?} value
                 * @param {?} args
                 * @return {?}
                 */
                validate: function (value, args) {
                    return true;
                }
            }
        });
    };
}

/**
 * @param {?=} validationOptions
 * @return {?}
 */
function IsBirthDate(validationOptions) {
    return function (object, propertyName) {
        registerDecorator({
            name: "IsBirthDate",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'isBirthDate', 'value': true }],
            options: validationOptions,
            validator: {
                /**
                 * @param {?} value
                 * @param {?} args
                 * @return {?}
                 */
                validate: function (value, args) {
                    return true;
                }
            }
        });
    };
}

/**
 * @param {?=} options
 * @return {?}
 */
function IsCalendar(options) {
    return function (object, propertyName) {
        registerDecorator({
            name: "isCalendar",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'isCalendar', value: options }],
            validator: {
                /**
                 * @param {?} value
                 * @param {?} args
                 * @return {?}
                 */
                validate: function (value, args) {
                    return true;
                }
            }
        });
    };
}

/**
 * @param {?=} options
 * @return {?}
 */
function IsDateRange(options) {
    return function (object, propertyName) {
        registerDecorator({
            name: "isDateRange",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'isDateRange', value: options }],
            validator: {
                /**
                 * @param {?} value
                 * @param {?} args
                 * @return {?}
                 */
                validate: function (value, args) {
                    return true;
                }
            }
        });
    };
}

/**
 * @return {?}
 */
function IsPassword() {
    return function (object, propertyName) {
        registerDecorator({
            name: "isPassword",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'isPassword' }],
            validator: {
                /**
                 * @param {?} value
                 * @return {?}
                 */
                validate: function (value) {
                    return true;
                }
            }
        });
    };
}

/**
 * @param {?=} property
 * @param {?=} validationOptions
 * @return {?}
 */
function IsPhoneNumber(property, validationOptions) {
    return function (object, propertyName) {
        registerDecorator({
            name: "isPhoneNumber",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'isPhoneNumber', 'value': property }],
            options: validationOptions,
            validator: {
                /**
                 * @param {?} value
                 * @param {?} args
                 * @return {?}
                 */
                validate: function (value, args) {
                    var /** @type {?} */ r = /[\\+ 0-9]/;
                    return r.test(value);
                }
            }
        });
    };
}

/**
 * @param {?=} options
 * @param {?=} validationOptions
 * @return {?}
 */
function IsRating(options, validationOptions) {
    return function (object, propertyName) {
        registerDecorator({
            name: "isRating",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'isRating', 'value': options }],
            options: validationOptions,
            validator: {
                /**
                 * @param {?} value
                 * @param {?} args
                 * @return {?}
                 */
                validate: function (value, args) {
                    return true;
                }
            }
        });
    };
}

/**
 * @param {?=} length
 * @param {?=} validationOptions
 * @return {?}
 */
function IsText(length, validationOptions) {
    return function (object, propertyName) {
        registerDecorator({
            name: "isText",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'isText', 'value': length }],
            options: validationOptions,
            validator: {
                /**
                 * @param {?} value
                 * @param {?} args
                 * @return {?}
                 */
                validate: function (value, args) {
                    return (!length || value.length < length ? true : false);
                }
            }
        });
    };
}

/**
 * @param {?=} options
 * @param {?=} validationOptions
 * @return {?}
 */
function IsNumpad(options, validationOptions) {
    return function (object, propertyName) {
        registerDecorator({
            name: "isNumpad",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'isNumpad', 'value': options }],
            options: validationOptions,
            validator: {
                /**
                 * @param {?} value
                 * @param {?} args
                 * @return {?}
                 */
                validate: function (value, args) {
                    return true;
                }
            }
        });
    };
}

/**
 * @param {?=} options
 * @return {?}
 */
function IsSelect(options) {
    return function (object, propertyName) {
        registerDecorator({
            name: "isSelect",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'isSelect', value: options }],
            validator: {
                /**
                 * @param {?} value
                 * @param {?} args
                 * @return {?}
                 */
                validate: function (value, args) {
                    return new Promise(function (resolve, reject) {
                        var /** @type {?} */ optionValidator = {
                            target: value,
                            source: args.constraints[0].value.source,
                            getOptions: function () {
                                return new Promise(function (resolveOptions, rejectOptions) {
                                    if (optionValidator.source) {
                                        get(optionValidator.source.url).type('json').end(function (response) {
                                            var /** @type {?} */ options = [];
                                            if (response.error) {
                                                rejectOptions(response.error);
                                            }
                                            else {
                                                response.body.forEach(function (item) {
                                                    options.push({
                                                        value: optionValidator._getPropertyFromObject(item, optionValidator.source.mapping.value),
                                                        text: optionValidator._getPropertyFromObject(item, optionValidator.source.mapping.text),
                                                        disabled: optionValidator.source.mapping.disabled !== undefined ? optionValidator._getPropertyFromObject(item, optionValidator.source.mapping.disabled) : false,
                                                    });
                                                });
                                                resolveOptions(options);
                                            }
                                        });
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
                            var /** @type {?} */ allValide = true;
                            var /** @type {?} */ values = {};
                            options.forEach(function (option) {
                                if (!option.disabled) {
                                    values[typeof option.value == 'object' ? sha1(option.value) : option.value] = true;
                                }
                            });
                            optionValidator.target.forEach(function (value) {
                                if (values[typeof value == 'object' ? sha1(value) : value] == undefined) {
                                    allValide = false;
                                }
                            });
                            if (allValide) {
                                resolve(true);
                            }
                            else {
                                resolve(false);
                            }
                        }).catch(function (error) {
                            resolve(false);
                        });
                    });
                }
            }
        });
    };
}

/**
 * @param {?} typeOfItems
 * @param {?=} usePropertyAsUuid
 * @param {?=} uniqueItems
 * @return {?}
 */
function IsList(typeOfItems, usePropertyAsUuid, uniqueItems) {
    return function (object, propertyName) {
        registerDecorator({
            name: "isList",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'isList', 'value': typeOfItems, 'usePropertyAsUuid': usePropertyAsUuid, 'uniqueItems': uniqueItems == undefined ? false : uniqueItems }],
            validator: {
                /**
                 * @param {?} value
                 * @param {?} args
                 * @return {?}
                 */
                validate: function (value, args) {
                    return new Promise(function (resolve, reject) {
                        var /** @type {?} */ requiredValidations = value.length;
                        var /** @type {?} */ proceededValidations = 0;
                        var /** @type {?} */ allValide = true;
                        if (value.length == 0) {
                            resolve(true);
                        }
                        value.forEach(function (itemOriginal) {
                            var /** @type {?} */ item = null;
                            try {
                                // hint: global is used for backend node.js services
                                item = typeof global == 'undefined' ? new typeOfItems() : (typeof typeOfItems == 'string' && global[typeOfItems] !== undefined ? new global[typeOfItems]() : new typeOfItems());
                                item.loadJson(itemOriginal).then().catch();
                            }
                            catch (e) {
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

export { PersistableModel, HasConditions, HasDescription, HasLabel, HasPrecision, IsBirthDate, IsCalendar, IsDateRange, IsPassword, IsPhoneNumber, IsRating, IsText, IsNumpad, IsSelect, IsList };
export { ValidatorConstraint, Validate, ValidateNested, ValidateIf, IsDefined, Equals, NotEquals, IsEmpty, IsNotEmpty, IsIn, IsNotIn, IsOptional, IsBoolean, IsDate, IsNumber, IsInt, IsString, IsDateString, IsArray, IsEnum, IsDivisibleBy, IsPositive, IsNegative, Min, Max, MinDate, MaxDate, IsBooleanString, IsNumberString, Contains, NotContains, IsAlpha, IsAlphanumeric, IsAscii, IsBase64, IsByteLength, IsCreditCard, IsCurrency, IsEmail, IsFQDN, IsFullWidth, IsHalfWidth, IsVariableWidth, IsHexColor, IsHexadecimal, IsIP, IsISBN, IsISIN, IsISO8601, IsJSON, IsLowercase, IsMobilePhone, IsMongoId, IsMultibyte, IsSurrogatePair, IsUrl, IsUUID, IsUppercase, Length, MinLength, MaxLength, Matches, IsMilitaryTime, ArrayContains, ArrayNotContains, ArrayNotEmpty, ArrayMinSize, ArrayMaxSize, ArrayUnique } from 'class-validator/decorator/decorators';
