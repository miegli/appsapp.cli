"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Observable_1 = require("rxjs/Observable");
var class_validator_1 = require("class-validator");
var class_transformer_1 = require("class-transformer");
var class_validator_2 = require("class-validator");
var class_validator_3 = require("class-validator");
var angular2_uuid_1 = require("angular2-uuid");
var PersistableModel = /** @class */ (function () {
    /**
     * PersistanceManager as an optional argument when changes were persisted to stable database
     */
    function PersistableModel() {
        var _this = this;
        this.__uuid = '';
        this.__firebaseDatabaseRoot = 'session';
        this.__bindings = {};
        this.__bindingsObserver = {};
        this.__validator = {};
        this.__validatorObserver = {};
        this.__edited = {};
        this.__temp = {};
        this.__forceUpdateProperty = {};
        this.__isOnline = false;
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
        this.__observable = new Observable_1.Observable(function (observer) {
            self.__observer = observer;
            self.__observer.next(_this);
        });
        /**
         * creates and update bindings for getProperty()-Method
         */
        this.__observable.subscribe(function (next) {
            if (!self.hasPendingChanges() || self.getFirebaseDatabase() === undefined) {
                if (self.__bindingsObserver) {
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
        var observable = new Observable_1.Observable(function (observer) {
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
     * save with optional observable
     * @param action
     * @param silent
     * @returns {Observable<any>}
     */
    PersistableModel.prototype.save = function (action, silent) {
        var self = this, observer = null;
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
        return new Observable_1.Observable(function (o) {
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
        return new Observable_1.Observable(function (observer) {
            self.validate().then(function () {
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
            }).catch(function (error) {
                observer.error(error);
            });
        });
    };
    /**
     * resets to previous data
     * @returns {PersistableModel}
     */
    PersistableModel.prototype.reset = function () {
        var self = this;
        self.__edited = {};
        self.emit();
        if (this.__persistenceManager) {
            this.__persistenceManager.load(self).then(function (model) {
                self.emit();
            }).catch(function (error) {
                console.log(error);
            });
        }
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
        this.__uuid = uuid;
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
        this.getPersistanceManager().getFirebase().getAuth().then(function (auth) {
            auth.authState.subscribe(function (user) {
                if (user && self.__persistenceManager) {
                    self.__persistenceManager.getObserver().next({ 'action': 'connected' });
                }
                self.emit();
            });
        });
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
     * get obervable property for using as an binding variable
     * @returns {Observable<any>}
     */
    PersistableModel.prototype.getProperty = function (property) {
        var self = this;
        if (!self.__bindings[property]) {
            self.__bindings[property] = new Observable_1.Observable(function (observer) {
                self.__bindingsObserver[property] = observer;
            });
            window.setTimeout(function () {
                if (self.__bindingsObserver[property] !== undefined) {
                    self.__bindingsObserver[property].next(self[property]);
                }
            });
        }
        return self.__bindings[property];
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
        return this.__messages[keyword] == undefined ? keyword : this.__messages[keyword];
    };
    /**
     * set property value for using as an binding variable
     * @param {string} property
     * @param {any} value
     * @returns {PersistableModel}
     */
    PersistableModel.prototype.setProperty = function (property, value) {
        this[property] = value;
        this.__edited[property] = value;
        this.executeConditionValidatorCircular(property);
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
    PersistableModel.prototype.setPersistanceManager = function (persistenceManager) {
        this.__persistenceManager = persistenceManager;
        this.__uuid = angular2_uuid_1.UUID.UUID();
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
            self.__validator[property] = new Observable_1.Observable(function (observer) {
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
                this.__conditionActionIfMatches[property] = new Observable_1.Observable(function (observer) {
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
     * load json data
     * @param {object|string} stringified or real json object
     * @returns {Promise<any>}
     */
    PersistableModel.prototype.loadJson = function (json) {
        var self = this;
        var model = class_transformer_1.plainToClass(this.constructor, typeof json == 'string' ? JSON.parse(json) : json, { excludePrefixes: ["__"] });
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
                            self[property] = self.transformTypeFromMetadata(property, model[property]);
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
        return value;
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
        if (noUnderScoreData) {
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
    PersistableModel.prototype.getPersistanceManager = function () {
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
     * get metadata contraints value
     * @param property
     * @param type
     * @returns {any}
     */
    PersistableModel.prototype.getMetadataValue = function (property, type) {
        if (this.getMetadata(property, type)[0] && this.getMetadata(property, type)[0].constraints) {
            if (this.getMetadata(property, type)[0].constraints.length == 1) {
                if (this.getMetadata(property, type)[0].constraints[0].type && Object.keys(this.getMetadata(property, type)[0].constraints[0]).indexOf('value')) {
                    return this.getMetadata(property, type)[0].constraints[0].value == undefined ? true : this.getMetadata(property, type)[0].constraints[0].value;
                }
                return this.getMetadata(property, type)[0].constraints[0];
            }
            else {
                return this.getMetadata(property, type)[0].constraints;
            }
        }
        if (this.getMetadata(property, type)[0] && this.getMetadata(property, type)[0].validationTypeOptions) {
            if (this.getMetadata(property, type)[0].validationTypeOptions.length == 1) {
                return this.getMetadata(property, type)[0].validationTypeOptions[0];
            }
            else {
                return this.getMetadata(property, type)[0].validationTypeOptions;
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
                self.__conditionActionIfMatches[validator.propertyName] = new Observable_1.Observable(function (observer) {
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
        // if (!prepare) {
        //   Object.keys(self.__conditionActionIfMatchesRemovedProperties).forEach((property) => {
        //     console.log(property);
        //     self.setProperty(property, null);
        //   });
        // }
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
        self.__conditionActionIfMatchesObserver[property].next({
            action: self.__conditionActionIfMatchesAction[property],
            state: result.length ? true : false
        });
        self.recoverMissingProperty(property);
        self.__conditionActionIfMatchesRemovedProperties[property] = result.length ? true : false;
        if (self.__validatorObserver[property]) {
            self.__validatorObserver[property].next(result.length ? true : false);
        }
        if (this.__conditionContraintsAffectedProperties[property] !== undefined) {
            Object.keys(this.__conditionContraintsAffectedProperties[property]).forEach(function (affectedProperty) {
                var result = class_validator_1.validateSync(self, { groups: ["condition_" + affectedProperty] });
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
     * send notification message to user
     * @param message
     * @param error
     * @returns {PersistableModel}
     */
    PersistableModel.prototype.notify = function (message, error) {
        this.__notificationProvider(message, error);
        return this;
    };
    return PersistableModel;
}());
exports.PersistableModel = PersistableModel;
