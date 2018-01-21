import {AngularFireDatabase, AngularFireObject} from "angularfire2/database";
import {validate, validateSync} from "class-validator";
import {plainToClass, serialize} from "class-transformer";
import {AngularFireAuth} from "angularfire2/auth";
import {getFromContainer} from "class-validator";
import {MetadataStorage} from "class-validator";
import {UUID} from "angular2-uuid";
import {AppsappModuleProviderMessages} from "../interfaces/messages";
import {HttpClient} from "@angular/common/http";
import * as objectHash from 'object-hash';
import {Observable, Observer} from 'rxjs';

declare var global: any;

export interface actionEmail {
    name: 'email',
    data: {
        template?: string,
        to: string,
        from?: string,
        subject?: string
    },
    additionalActions?: [actionEmail | actionWebhook | actionGoogleSheets | actionCustom]
}

export interface actionGoogleSheets {
    name: 'googleSheets',
    data?: {
        to: string,
        from?: string,
        subject?: string
    },
    additionalActions?: [actionEmail | actionWebhook | actionGoogleSheets | actionCustom]
}

export interface actionWebhook {
    name: 'webhook',
    data: {
        url: string,
        method: 'get' | 'post' | 'head' | 'put' | 'patch' | 'delete',
        type: 'json' | 'html' | 'xml'
    },
    additionalActions?: [actionEmail | actionWebhook | actionGoogleSheets | actionCustom]
}

export interface actionCustom {
    name: 'custom',
    data: {
        name: string
    },
    additionalActions?: [actionEmail | actionWebhook | actionGoogleSheets | actionCustom]
}


export class PersistableModel {

    private __httpClient: HttpClient;
    private __isLoadedPromise: Promise<any>;
    private __observer: Observer<any>;
    private __observable: Observable<any>;
    private __uuid: string = '';
    private __firebaseDatabase: AngularFireDatabase;
    private __firebaseDatabasePath: string;
    private __firebaseDatabaseRoot: string = 'session';
    private __angularFireObject: AngularFireObject<any>;
    private __bindings = {};
    private __bindingsObserver = {};
    private __validator = {};
    private __validatorObserver = {};
    private __edited = {};
    private __editedObserver: Observer<any>;
    private __editedObservable: Observable<any>;
    private __editedObservableCallbacks: any = [];
    private __temp = {};
    private __forceUpdateProperty = {};
    private __persistenceManager: any;
    private __isOnline: boolean = true;
    private __validationErrors: any = {};
    private __metadata = [];
    private _hasPendingChanges: boolean = false;
    private __conditionBindings: any = {};
    private __conditionActionIfMatches: any = {};
    private __conditionActionIfMatchesAction: any = {};
    private __conditionActionIfMatchesObserver: any = {};
    private __conditionActionIfMatchesRemovedProperties: any = {};
    private __conditionContraintsProperties: any = {};
    private __conditionContraintsPropertiesValue: any = {};
    private __conditionContraintsAffectedProperties: any = {};
    private __messages: AppsappModuleProviderMessages;
    private __appsAppModuleProvider: any;
    private __notificationProvider: any;
    private __parent: any;
    private __hashedValues: object = {};

    /**
     * PersistanceManager as an optional argument when changes were persisted to stable database
     */
    constructor() {

        this.__metadata = getFromContainer(MetadataStorage).getTargetValidationMetadatas(this.constructor, '');

        // check if all loaded metadata has corresponding properties
        this.__metadata.forEach((metadata) => {

            if (this[metadata.propertyName] == undefined) {
                this[metadata.propertyName] = null;
            }
        });


        this.__init();

    }

    /**
     *
     * @private
     */
    private __init() {


        let self = this;


        /**
         * create observerable and observer for handling the models data changes
         */
        this.__editedObservable = new Observable<any>((observer: Observer<any>) => {
            self.__editedObserver = observer;
        });

        /**
         * create observerable and observer for handling the models data changes
         */
        this.__observable = new Observable<any>((observer: Observer<any>) => {
            self.__observer = observer;
            self.__observer.next(this);
        });


        /**
         * creates and update bindings for getProperty()-Method
         */
        this.__observable.subscribe((next) => {

            if (!self.hasPendingChanges() || self.getFirebaseDatabase() === undefined) {

                if (self.__bindingsObserver) {
                    Object.keys(self.__bindingsObserver).forEach((property) => {
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


    }

    /**
     * get http client
     * @returns HttpClient
     */
    public getHttpClient() {
        return this.__httpClient;
    }

    /**
     * set http client
     * @param HttpClient http
     * @returns {PersistableModel}
     */
    private setHttpClient(http) {

        this.__httpClient = http;
        return this;

    }

    /**
     * update property
     * @param property
     * @param value
     */
    public update(property, value) {

        let observer = this.setProperty(property, value).setHasNoChanges(property).getPropertyObserver(property);
        if (observer) {
            observer.next(value);
        }


        try {
            delete this.__bindings[property];
        } catch (e) {
            // e
        }


        return this;

    }

    /**
     * call next method on observer
     * @returns {PersistableModel}
     */
    public emit() {
        if (this.__observer) {
            this.__observer.next(this);
        }
        return this;
    }


    /**
     * save with optional observable
     * @param action
     * @returns {Promise<any>}
     */
    public saveWithPromise(action?: actionEmail | actionWebhook | actionGoogleSheets | actionCustom) {

        let self = this;

        return new Promise(function (resolve, reject) {

            self.save(action).subscribe((next) => {

            }, (error) => {

                reject(error);

            }, () => {

                resolve();

            })


        });

    }


    /**
     * execute cation
     * @param action
     * @returns {Promise<any>}
     */
    public action(action: { name: string, data?: {} }) {

        let self = this;

        let observable = new Observable<any>((observer: Observer<any>) => {

            if (self.__persistenceManager) {
                self.__persistenceManager.action(self, observer, action).then((success) => {
                    observer.complete();
                }).catch((error) => {
                    observer.error(error);
                });
            } else {
                observer.error('No persistence Manger provided');
            }

        });


        return new Promise(function (resolve, reject) {

            observable.subscribe((next) => {
            }, (error) => {
                reject(error);
            }, () => {
                resolve();
            })

        });


    }


    /**
     * trigger custom action
     * @param string action
     * @param boolean silent
     * @returns {Observable<any>}
     */
    public trigger(action: string) {

        var self = this;

        return new Observable<any>((observer: Observer<any>) => {
            this.getPersistenceManager().trigger(self, observer, {
                name: 'custom',
                data: {
                    name: action
                }
            });
        });

    }


    /**
     * save with optional observable
     * @param action
     * @param silent
     * @returns {Observable<any>}
     */
    public save(action?: actionEmail | actionWebhook | actionGoogleSheets | actionCustom, silent?: boolean) {

        let self = this, observer = null;

        self.executeSave(action).subscribe((next) => {
            if (observer) {
                observer.next(next);
            } else {
                if (!silent) {
                    self.notify(next);
                }
            }
        }, (error) => {
            if (observer) {
                observer.error(error);
            } else {
                if (!silent) {
                    self.notify(error, true);
                }
            }
        }, () => {
            if (observer) {
                observer.complete();
            } else {
                if (!silent) {
                    self.notify(self.getMessage('done'));
                }
            }
        });

        return new Observable<any>((o: Observer<any>) => {
            observer = o;
        });


    }


    /**
     * save model and persist if is persistable
     * @param {any} action as an optinal argument for transmitting additional action metadata
     * @returns {Observable<any>}
     */
    private executeSave(action?: actionEmail | actionWebhook | actionGoogleSheets | actionCustom) {

        let self = this;

        Object.keys(self.__edited).forEach((property) => {
            self[property] = self.__edited[property];
        });


        return new Observable<any>((observer: Observer<any>) => {


            self.setHasPendingChanges(true, action);


            if (self.__persistenceManager) {
                self.__persistenceManager.save(self, observer, action).then((success) => {
                    self.__edited = {};

                    if (action) {
                        if (self.isOnline()) {
                            observer.next(self.getMessage('submitted'));
                        } else {
                            observer.next(self.getMessage('submittedInBackground'));
                        }
                    } else {
                        observer.complete();
                    }

                }).catch((error) => {
                    self.__edited = {};
                    observer.error(error);
                });

            } else {
                observer.error('No persistence Manger provided');
                self.__edited = {};
            }


        });


    }

    /**
     * resets to previous data
     * @returns {PersistableModel}
     */
    public reset() {

        let self = this;

        self.__edited = {};
        self.emit();

        if (this.__persistenceManager) {
            this.__persistenceManager.load(self).then((model: any) => {
                self.emit();
            }).catch((error) => {
                console.log(error);
            });

        }
        return this;


    }

    /**
     * get models observer
     * @returns {Observer<any>}
     */
    public getObserver() {
        return this.__observer;
    }

    /**
     * get models obervable
     * @returns {Observable<any>}
     */
    public getObservable() {
        return this.__observable;
    }

    /**
     * set uuid
     * @param uuid
     * @returns {PersistableModel}
     */
    public setUuid(uuid?) {
        this.__uuid = uuid !== undefined ? uuid : UUID.UUID();
        return this;
    }

    /**
     * get uuid
     * @returns {string}
     */
    public getUuid() {
        return this.__uuid;
    }

    /**
     * get models constructors name as an object identifier
     * return {string}
     */
    public getObjectIdentifier() {
        return this.constructor.name;
    }

    /**
     * set firebaseDatabase
     * @param {AngularFireDatabase}
     * @returns {PersistableModel}
     */
    public setFirebaseDatabase(firebaseDatabase) {

        this.__firebaseDatabase = firebaseDatabase;
        let self = this;


        let connectedRef = this.__firebaseDatabase.app.database().ref(".info/connected");

        connectedRef.on("value", (snap) => {
            self.__isOnline = snap.val();
            if (self.__persistenceManager && self.__isOnline) {
                self.__persistenceManager.getObserver().next({'action': 'connected'});
            }
            if (self.__persistenceManager && !self.__isOnline) {
                self.__persistenceManager.getObserver().next({'action': 'disconnected'});
            }

        });


        this.getPersistenceManager().getFirebase().getAuth().then((auth: AngularFireAuth) => {
            auth.authState.subscribe((user) => {
                if (user && self.__persistenceManager) {
                    self.__persistenceManager.getObserver().next({'action': 'connected'});
                }
                self.emit();
            });
        });


        return this;

    }


    /**
     * get firebase database
     * @returns {AngularFireDatabase}
     */
    public getFirebaseDatabase() {
        return this.__firebaseDatabase;
    }

    /**
     * set firebase database path
     * @param path
     * @returns {PersistableModel}
     */
    public setFirebaseDatabasePath(path) {
        this.__firebaseDatabasePath = path;
        this.registerConditionValidators(false);
        return this;
    }


    /**
     * get firebase database path
     * @returns {string}
     */
    public getFirebaseDatabasePath() {
        return this.__firebaseDatabasePath;
    }


    /**
     * set firebaseDatabaseObject
     * @param firebaseDatabaseObject
     * @returns {PersistableModel}
     */
    public setFirebaseDatabaseObject(firebaseDatabaseObject) {
        this.__angularFireObject = firebaseDatabaseObject;
        return this;
    }


    /**
     * get firebaseDatabaseObject
     * @returns {AngularFireObject<any>}
     */
    public getFirebaseDatabaseObject() {
        return this.__angularFireObject;

    }

    /**
     * get firebaseDatabase prefix
     * @returns string
     */
    public getFirebaseDatabaseRoot() {
        return this.__firebaseDatabaseRoot;
    }


    /**
     * set firebase databse path prefix
     * @param path
     * @returns {PersistableModel}
     */
    public setFirebaseDatabaseRoot(path) {

        this.__firebaseDatabaseRoot = path;

        return this;

    }

    /**
     * get property
     * @returns any
     */
    public getProperty(property) {

        let self = this;

        if (this.isInBackendMode()) {
            return self.getPropertyValue(property);
        } else {
            if (!self.__bindings[property]) {

                self.__bindings[property] = new Observable<any>((observer: Observer<any>) => {
                    self.__bindingsObserver[property] = observer;
                });

                window.setTimeout(() => {
                    if (self.__bindingsObserver[property] !== undefined) {
                        self.__bindingsObserver[property].next(self[property]);
                    }
                });

            }

            return self.__bindings[property];
        }


    }


    /**
     * get observer property for using as an binding variable
     * @returns {Observer<any>}
     */
    private getPropertyObserver(property) {


        if (this.__bindingsObserver[property]) {
            return this.__bindingsObserver[property];
        } else {
            return null;
        }


    }

    /**
     * set module provider messages
     * @param {AppsappModuleProviderMessages} messages
     * @returns {PersistableModel}
     */
    private setMessages(messages: AppsappModuleProviderMessages) {

        this.__messages = messages;
        return this;

    }

    /**
     * get modules providers message
     * @param keyword
     * @returns {any}
     */
    public getMessage(keyword) {

        return this.__messages[keyword] == undefined ? keyword : this.__messages[keyword];

    }

    /**
     * set property value for using as an binding variable
     * @param {string} property
     * @param {any} value
     * @returns {PersistableModel}
     */
    public setProperty(property, value) {

        this[property] = value;
        this.__edited[property] = value;
        var event = {property: property, value: value, model: this};
        if (this.__editedObserver) {
            this.__editedObserver.next(event);
        }
        this.executeConditionValidatorCircular(property);
        this.executeChangesWithCallback(event);
        return this;
    }


    /**
     * return current property value
     * @param property
     * @param {boolean} get value is in editing mode
     * @returns {any}
     */
    public getPropertyValue(property, editing?) {

        if (editing) {
            return this.__edited[property] ? this.__edited[property] : this[property];
        } else {
            return this[property];
        }

    }

    /**
     * get properties
     * @param stringify
     */
    public getProperties(stringify?) {

        let properties = {}, self = this;

        Object.keys(self).forEach((property) => {
            if (property.substr(0, 1) !== '_') {
                if (stringify) {
                    properties[property] = self.__toString(property);
                } else {
                    properties[property] = self.getPropertyValue(property);
                }
            }
        });

        return properties;

    }


    /**
     * return string representative from given property value
     * @param property
     * @param {boolean} get value is in editing mode
     * @returns {any}
     */
    public __toString(property?) {

        if (property === undefined) {
            return this.serialize();
        }

        let s = null, self = this;

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
                } else {
                    s = self.getPropertyValue(property);
                }


        }


        return s;

    }

    /**
     * set persistenceManager
     * @param persistenceManager
     * @returns {PersistableModel}
     */
    public setPersistenceManager(persistenceManager) {
        this.__persistenceManager = persistenceManager;

        if (this.__uuid.length == 0) {
            this.__uuid = UUID.UUID();
        }
        return this;
    }


    /**
     * valid this object
     * @param {boolean} softcheck
     * @returns {Promise<any>}
     */
    public validate(softcheck?) {

        let self = this;
        return new Promise(function (resolve, reject) {

            self.removeConditionProperties();


            validate(self, {skipMissingProperties: true}).then(errors => { // errors is an array of validation errors


                if (errors.length > 0) {

                    if (softcheck) {
                        resolve();
                    } else {
                        reject(errors);
                    }

                    self.__validationErrors = {};
                    errors.forEach((error) => {
                        self.__validationErrors[error.property] = error;
                    });

                } else {
                    resolve();
                    self.__validationErrors = {};
                }

                Object.keys(self.__validatorObserver).forEach((property) => {

                    if (self.__validationErrors[property] === undefined) {
                        self.__validatorObserver[property].next(false);
                    } else {
                        self.__validatorObserver[property].next(self.__validationErrors[property]);
                    }

                });


            });


        });


    }


    /**
     * remove properties with invalid condition validators
     * @returns {PersistableModel}
     */
    private removeConditionProperties() {

        let self = this;

        if (self.__conditionActionIfMatchesRemovedProperties) {
            Object.keys(self.__conditionActionIfMatchesRemovedProperties).forEach((property) => {
                if (self.__conditionActionIfMatchesRemovedProperties[property]) {
                    if (self[property] !== undefined) {
                        self.__temp[property] = self[property];
                        delete self[property];
                    }
                }
            });
        }

        return this;
    }


    /**
     * get validation observable for given property
     * @param {string} property
     * @return {boolean}
     */
    public getValidation(property) {

        let self = this;

        if (self.__validator[property] === undefined) {
            self.__validator[property] = new Observable<any>((observer: Observer<any>) => {
                self.__validatorObserver[property] = observer;
            });
        }

        return self.__validator[property];

    }


    /**
     * get condition observable for given property
     * @param property
     * @returns {Observable}
     */
    public getCondition(property) {

        if (this.__conditionActionIfMatches[property] == undefined) {

            if (Object.keys(this.__conditionActionIfMatches).length) {
                this.registerConditionValidators(true);
            }

            if (this.__conditionActionIfMatches[property] === undefined) {
                this.__conditionActionIfMatches[property] = new Observable<any>((observer: Observer<any>) => {
                    this.__conditionActionIfMatchesObserver[property] = observer;
                });

            }

        }

        return this.__conditionActionIfMatches[property];

    }


    /**
     * is the object/property on editing state
     * @param {string} property as an optional argument
     * @returns {boolean}
     */
    public hasChanges(property?) {

        if (property) {

            return !(this.__edited[property] === undefined);

        } else {

            return (Object.keys(this.__edited).length)

        }


    }

    /**
     * remove changes state
     * @param {string} property as an optional argument
     * @returns {boolean}
     */
    private setHasNoChanges(property?) {

        if (property) {
            this.__forceUpdateProperty[property] = true;

            if (this.__edited[property]) {
                try {
                    delete this.__edited[property];
                } catch (e) {
                    //
                }
            }
        } else {
            this.__edited = {};
        }

        return this;


    }

    /**
     * import dynamic properties
     * @param {propertiesAsObject}
     * @returns {Promise<any>}
     */
    public importDynamicProperties(propertiesAsObject) {

        let self = this;

        return new Promise(function (resolve, reject) {

            Object.keys(propertiesAsObject).forEach((property) => {
                self[property] = self.transformTypeFromMetadata(property, propertiesAsObject[property]);
            });

            resolve(self);

        });


    }


    /**
     * load json data
     * @param {object|string} stringified or real json object
     * @returns {Promise<any>}
     */
    public loadJson(json) {

        let self = this;

        let model = <any>plainToClass(<any>this.constructor, typeof json == 'string' ? JSON.parse(json) : json, {excludePrefixes: ["__"]});


        return new Promise(function (resolve, reject) {

            if (model) {


                let propertiesWithValidationError = {};
                model.validate().then((success) => {
                }).catch((error) => {
                    Object.keys(error).forEach((e: any) => {
                        propertiesWithValidationError[e.property] = true;
                    });
                });


                // all properties without validation error
                Object.keys(json).forEach((property) => {
                    if (property.substr(0, 2) !== '__' && propertiesWithValidationError[property] === undefined) {
                        if (Object.keys(self).indexOf(property) >= 0) {
                            self[property] = self.transformTypeFromMetadata(property, model[property]);
                            if (model.isInBackendMode()) {
                                self.__edited[property] = self[property];
                            }
                        }
                    }
                });


                resolve(self);

            } else {
                resolve(self);
            }

        });

    }

    /**
     * transform type from metadata to avoid non matching data types
     * @param property
     * @param value
     * @returns {any}
     */
    private transformTypeFromMetadata(property, value) {

        let self = this;

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
            let valueAsObjects = [];
            if (value.length) {
                value.forEach((itemOriginal) => {
                    if (itemOriginal instanceof PersistableModel == false && self.getAppsAppModuleProvider()) {
                        let item = self.getAppsAppModuleProvider().new(self.getMetadataValue(property, 'isList'));
                        item.loadJson(itemOriginal);
                        item.setParent(self);
                        item.loaded().then((m) => {
                            item.getChangesObserverable().subscribe((next) => {
                                if (next.model.getParent()) {
                                    next.model.getParent().setProperty(property, self.getPropertyValue(property, true));
                                }

                            })
                        });
                        valueAsObjects.push(item);
                    } else {
                        valueAsObjects.push(itemOriginal);
                    }
                });
            }

            return valueAsObjects;
        }

        if (this.getMetadata(property, 'isSelect').length) {

            let values = typeof value == 'object' ? value : [];
            let realValues = [];
            if (values.length) {
                values.forEach((val) => {
                    realValues.push(self.getHashedValue(val));
                });
            }
            return realValues;

        }

        return value;

    }

    /**
     * Transform all properties
     * @returns {PersistableModel}
     */
    private transformAllProperties() {

        let self = this;

        Object.keys(self).forEach((property) => {
            if (property.substr(0, 1) !== '_') {
                self[property] = self.transformTypeFromMetadata(property, self[property]);
            }
        });

        return this;

    }

    /**
     * has model pending changes that are not synchronised yet or not
     * @returns {boolean}
     */
    public hasPendingChanges() {

        return this._hasPendingChanges;
    }

    /**
     * set pending changes state
     * @param {boolean} state
     * @param {any} action as an optional argument
     * @returns {PersistableModel}
     */
    public setHasPendingChanges(state, action?: actionEmail | actionWebhook | actionGoogleSheets | actionCustom) {

        if (state && this.__persistenceManager) {
            this.__persistenceManager.addPendingChanges(this, action);
        }

        if (!state && this.__persistenceManager) {
            this.__persistenceManager.removePendingChanges(this);
        }

        this._hasPendingChanges = state;

        return this;
    }

    /**
     * serialize this object
     * @param {boolean} noUnderScoreData
     * @param {boolean} force returning as an real object, otherwise return stringified object
     * @returns {any}
     */
    public serialize(noUnderScoreData?, asObject?) {

        let json = '';

        if (noUnderScoreData) {
            json = serialize(this, {excludePrefixes: ["__", "_"]});
        } else {
            json = serialize(this, {excludePrefixes: ["__"]});
        }


        if (asObject) {
            return JSON.parse(json);
        } else {
            return json;
        }


    }


    /**
     * get the persistence manger
     * @returns {PersistenceManager}
     */
    public getPersistenceManager() {

        return this.__persistenceManager;

    }

    /**
     * check if current network state is online
     * @returns {boolean}
     */
    public isOnline() {
        return this.__isOnline;

    }

    /**
     * set if model is connected to internet
     * @param state
     */
    public setIsOnline(state) {
        this.__isOnline = state;
        return this;
    }

    /**
     * get properties metatadata
     * @param {string} property
     * @param {string} type
     * @returns {Array}
     */
    public getMetadata(property?: string, type?: string) {

        let validationMetadata = [];

        this.__metadata.forEach((metadata) => {
            if (!property || metadata.propertyName == property) {

                if (!type || metadata.type == type || (metadata.type == 'customValidation' && metadata.constraints && metadata.constraints[0].type == type)) {
                    validationMetadata.push(metadata);
                }

            }
        });

        return validationMetadata;

    }

    /**
     * check if property is type of array
     * @param property
     * @returns {boolean}
     */
    public isArray(property) {

        return typeof this[property] == 'object' ? (typeof this[property].length == 'number' ? true : false) : false;

    }


    /**
     * get metadata contraints value
     * @param property
     * @param type
     * @param metadata
     * @param string constraints
     * @returns {any}
     */
    public getMetadataValue(property?, type?, metadataInput?, constraints?) {
        let metadata = null;

        if (metadataInput == undefined) {
            metadata = this.getMetadata(property, type)[0];
        } else {
            if (metadataInput.length) {
                metadataInput.forEach((m) => {
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

            } else {
                return metadata.constraints;
            }

        }

        if (metadata && metadata.validationTypeOptions) {

            if (metadata.validationTypeOptions.length == 1) {
                return metadata.validationTypeOptions[0];
            } else {
                return metadata.validationTypeOptions;
            }

        }


        return null;

    }


    /**
     * resolves input type for given property
     * @param {string} property
     * @returns {any}
     */
    public getType(property) {

        let type = null;

        const typeMappings = {

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
            'customValidation': (metadata) => {

                if (metadata.constraints[0].type && metadata.constraints[0].type && metadata.constraints[0].type.substr(0, 3) !== 'has') {
                    return typeMappings[metadata.constraints[0].type] !== undefined ? typeMappings[metadata.constraints[0].type] : metadata.constraints[0].type;
                }
                return null;
            }

        }

        this.getMetadata(property).forEach((metadata) => {

            if (type == null && typeMappings[metadata.type] !== undefined) {

                if (typeof typeMappings[metadata.type] == 'string') {
                    type = typeMappings[metadata.type];
                } else if (typeof typeMappings[metadata.type] == 'function') {
                    type = typeMappings[metadata.type](metadata);
                }
            }

        });

        if (!type) {
            type = typeMappings[typeof this[property]] !== undefined ? typeMappings[typeof this[property]] : null;
        }

        return type ? type : 'text';


    }


    /**
     * registers condition validators
     * @param {boolean} prepare
     * @returns {PersistableModel}
     */
    private registerConditionValidators(prepare: boolean) {

        let self = this;

        self.__conditionBindings = {'request': {}, 'properties': {}};


        this.getMetadata(null, 'hasConditions').forEach((validator) => {

            let hasRealtimeTypes = false;


            self.__conditionActionIfMatchesRemovedProperties[validator.propertyName] = true;

            if (self.__conditionActionIfMatches[validator.propertyName] == undefined) {
                self.__conditionActionIfMatches[validator.propertyName] = new Observable<any>((observer: Observer<any>) => {
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


                validator.constraints[0].value.forEach((v) => {

                    if (v.type == 'limit') {
                        hasRealtimeTypes = true;
                    }

                    if (self.__conditionContraintsProperties[v.property] === undefined) {
                        self.__conditionContraintsProperties[v.property] = {}
                    }
                    self.__conditionContraintsProperties[v.property][v.type] = true;

                    if (self.__conditionContraintsAffectedProperties[v.property] === undefined) {
                        self.__conditionContraintsAffectedProperties[v.property] = {}
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
            Object.keys(self.__conditionContraintsProperties).forEach((property) => {
                if (self.__conditionContraintsProperties[property]['limit'] !== undefined) {
                    self.__conditionBindings['properties'][property] = self.getFirebaseDatabase().object(self.getFirebaseDatabasePath() + "/condition/properties/" + property);
                }
            });
        }


        return this;

    }


    private calculateCircularCondition(property: string, chain: object, counter: number) {

        let self = this;


        if (self.__conditionContraintsAffectedProperties[property] !== undefined) {

            Object.keys(self.__conditionContraintsAffectedProperties[property]).forEach((key) => {

                    if (key == property) {
                        return chain;
                    }
                    if (self.__conditionContraintsAffectedProperties[key] !== undefined) {

                        chain[key] = counter;
                        counter++;
                        self.calculateCircularCondition(key, chain, counter);
                        Object.keys(self.__conditionContraintsAffectedProperties[key]).forEach((k) => {
                            chain[k] = counter;

                        });

                    }

                }
            );

        }


        return chain;


    }


    /**
     *
     * @param property
     * @returns {PersistableModel}
     */
    private executeConditionValidatorCircular(property) {

        let self = this;

        let circularChain = {}, counter = 0;
        let obj = self.calculateCircularCondition(property, circularChain, counter);
        let keys = Object.keys(obj);
        keys.sort(function (a, b) {
            return obj[a] - obj[b]
        });


        self.executeConditionValidator(property);

        keys.forEach((key) => {
            self.executeConditionValidator(key);

        });


        return this;

    }

    /**
     *
     * @param property
     * @returns {PersistableModel}
     */
    private executeConditionValidator(property) {

        let self = this;


        if (self.__conditionContraintsProperties[property] !== undefined) {
            if (self.__conditionBindings['properties'][property] !== undefined) {
                self.__conditionBindings['properties'][property].set(self.__conditionContraintsPropertiesValue[property]);
            }

        }


        let result = validateSync(self, {groups: ["condition_" + property]});


        if (result.length) {
            self.__conditionContraintsPropertiesValue[property] = null;
        } else {
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

            Object.keys(this.__conditionContraintsAffectedProperties[property]).forEach((affectedProperty) => {


                let result = validateSync(self, {groups: ["condition_" + affectedProperty]});


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

    }

    /**
     * recovers a missing property
     * @param property
     * @returns {PersistableModel}
     */
    private recoverMissingProperty(property) {

        if (Object.keys(this).indexOf(property) == -1) {
            if (this.__temp[property] == undefined) {
                let tmpmodel = <any>plainToClass(<any>this.constructor, {}, {excludePrefixes: ["__"]});
                this[property] = tmpmodel[property];
            } else {
                this[property] = this.__temp[property];
            }
        }

        return this;

    }


    /**
     * set notificationProvider
     * @param notificationProvider
     * @returns {PersistableModel}
     */
    private setNotificationProvider(notificationProvider) {

        this.__notificationProvider = notificationProvider;

        return this;
    }


    /**
     *
     * @param promise
     * @returns {PersistableModel}
     */
    private setIsLoadedPromise(promise) {

        this.__isLoadedPromise = promise;

        return this;

    }

    /**
     * Is loaded promise
     * @returns {Promise}
     */
    public loaded() {
        return this.__isLoadedPromise;
    }

    /**
     * send notification message to user
     * @param message
     * @param error
     * @returns {PersistableModel}
     */
    public notify(message, error?) {

        this.__notificationProvider(message, error);

        return this;

    }


    /**
     * Get hased values
     * @Returns object
     */
    public getHashedValues() {

        let values = [];
        let self = this;

        Object.keys(this.__hashedValues).forEach((hash) => {
            values.push({value: self.__hashedValues[hash], hash: hash});
        });

        return values;

    }

    /**
     * Set hased values
     * @Returns mixed
     */
    public addHashedValue(value, hash) {

        this.__hashedValues[hash] = value;
        return this;

    }

    /**
     * Get value from hashed value
     * @param string hash
     * @Returns mixed
     */
    public getHashedValue(hash) {

        return this.__hashedValues[hash] !== undefined ? this.__hashedValues[hash] : hash;
    }

    /**
     * Set hashed value
     * @param string value
     * @param hash
     * @Returns string hash
     */
    public setHashedValue(value) {

        let hash = typeof value == 'object' ? objectHash.sha1(value) : value;
        this.__hashedValues[hash] = value;

        return hash;

    }

    /**
     * set appsAppModuleProvider
     * @param appsAppModuleProvider
     * @returns {this}
     */
    private setAppsAppModuleProvider(appsAppModuleProvider) {

        this.__appsAppModuleProvider = appsAppModuleProvider;

        return this;
    }

    /**
     * set appsAppModuleProvider
     * @returns {any}
     */
    public getAppsAppModuleProvider() {
        return this.__appsAppModuleProvider;
    }

    /**
     * set parent model
     * @param parentModel
     * @returns {this}
     */
    public setParent(parentModel) {
        this.__parent = parentModel;
        return this;
    }

    /**
     * get parent model
     * @returns {any}
     */
    public getParent() {
        return this.__parent;
    }

    /**
     * get changes observerable
     * @returns {Observable<any>}
     */
    public getChangesObserverable() {
        return this.__editedObservable;
    }

    /**
     * execute changes with callback
     * @param event
     * @returns {this}
     */
    private executeChangesWithCallback(event) {
        this.__editedObservableCallbacks.forEach((callback) => {
            callback(event);
        });

        return this;
    }

    /**
     * get changes with callback
     * @returns {this}
     */
    public getChangesWithCallback(callback) {
        this.__editedObservableCallbacks.push(callback);
        return this;
    }

    /**
     * get property value
     * @param property
     */
    public get(property: string) {
        return this.getPropertyValue(property);
    }

    /**
     * set property value
     * @param property
     */
    public set(property: string, value: any) {
        return this.setProperty(property, value);
    }

    /**
     * Check if model is initialized in backend mode
     * @returns {boolean}
     */
    public isInBackendMode() {
        return global[this.constructor.name] === undefined ? false : true;
    }

}
