import { AngularFireDatabase, AngularFireObject } from "angularfire2/database";
import { HttpClient } from "@angular/common/http";
import { Observable, Observer } from 'rxjs';
export interface actionEmail {
    name: 'email';
    data: {
        template?: string;
        to: string;
        from?: string;
        subject?: string;
    };
    additionalActions?: [actionEmail | actionWebhook | actionGoogleSheets | actionCustom];
}
export interface actionGoogleSheets {
    name: 'googleSheets';
    data?: {
        to: string;
        from?: string;
        subject?: string;
    };
    additionalActions?: [actionEmail | actionWebhook | actionGoogleSheets | actionCustom];
}
export interface actionWebhook {
    name: 'webhook';
    data: {
        url: string;
        method: 'get' | 'post' | 'head' | 'put' | 'patch' | 'delete';
        type: 'json' | 'html' | 'xml';
    };
    additionalActions?: [actionEmail | actionWebhook | actionGoogleSheets | actionCustom];
}
export interface actionCustom {
    name: 'custom';
    data?: {
        name: string;
    };
    additionalActions?: [actionEmail | actionWebhook | actionGoogleSheets | actionCustom];
}
export declare class PersistableModel {
    private __httpClient;
    private __isLoadedPromise;
    private __isLoadedPromiseInternal;
    private __isLoadedPromiseInternalResolver;
    private __isLoaded;
    private __isAutosave;
    private __observer;
    private __observable;
    private __uuid;
    private __firebaseDatabase;
    private __firebaseDatabasePath;
    private __firebaseDatabaseRoot;
    private __angularFireObject;
    private __bindings;
    private __bindingsObserver;
    private __validator;
    private __validatorObserver;
    private __edited;
    private __editedObserver;
    private __editedObservable;
    private __editedObservableCallbacks;
    private __editedObservableObservers;
    private __temp;
    private __persistenceManager;
    private __isOnline;
    private __validationErrors;
    private __loadedProperty;
    private __metadata;
    private __metadataCache;
    private _hasPendingChanges;
    private __conditionBindings;
    private __conditionActionIfMatches;
    private __conditionActionIfMatchesAction;
    private __conditionActionIfMatchesObserver;
    private __conditionActionIfMatchesRemovedProperties;
    private __conditionContraintsProperties;
    private __conditionContraintsPropertiesValue;
    private __conditionContraintsAffectedProperties;
    private __messages;
    private __appsAppModuleProvider;
    private __notificationProvider;
    private __parent;
    private tmp__hashedValues;
    private __propertySymbols;
    private __listArrays;
    private __isPersistableModel;
    /**
     * PersistanceManager as an optional argument when changes were persisted to stable database
     */
    constructor();
    /**
     *
     * @private
     */
    private __init();
    /**
     * get http client
     * @returns HttpClient
     */
    getHttpClient(): HttpClient;
    /**
     * set http client
     * @param HttpClient http
     * @returns {PersistableModel}
     */
    private setHttpClient(http);
    /**
     * call next method on observer
     * @returns {PersistableModel}
     */
    emit(): this;
    /**
     * save with optional observable
     * @param action
     * @returns {Promise<any>}
     */
    saveWithPromise(action?: actionEmail | actionWebhook | actionGoogleSheets | actionCustom | string): Promise<{}>;
    /**
     * execute cation
     * @param action
     * @returns {Promise<any>}
     */
    action(action: {
        name: string;
        data?: {};
    }): Promise<{}>;
    /**
     * trigger custom action
     * @param string action
     * @param integer interval repeat this trigger every interval seconds
     * @param integer maximal successfully execution counts
     * @returns {Observable<any>}
     */
    trigger(action: string, interval?: any, maxExecutions?: any): Observable<any>;
    /**
     * trigger a webhook url
     * @param {string} url
     * @param {"get" | "post" | "head" | "put" | "patch" | "delete"} method
     * @param {"json" | "html" | "xml"} type
     * @returns {Observable<any>}
     */
    webhook(url: string, method?: 'get' | 'post' | 'head' | 'put' | 'patch' | 'delete', type?: 'json' | 'html' | 'xml'): Observable<any>;
    /**
     * save with optional observable
     * @param action
     * @returns {Observable<any>}
     */
    save(action?: actionEmail | actionWebhook | actionGoogleSheets | actionCustom | string): Observable<any>;
    /**
     * save model and persist if is persistable
     * @param {any} action as an optinal argument for transmitting additional action metadata
     * @returns {Observable<any>}
     */
    private executeSave(action?);
    /**
     * resets model
     * @returns {PersistableModel}
     */
    reset(): this;
    /**
     * removes edited states
     * @returns {PersistableModel}
     */
    removeEditedState(): this;
    /**
     * get models observer
     * @returns {Observer<any>}
     */
    getObserver(): Observer<any>;
    /**
     * get models obervable
     * @returns {Observable<any>}
     */
    getObservable(): Observable<any>;
    /**
     * set uuid
     * @param uuid
     * @returns {PersistableModel}
     */
    setUuid(uuid?: any): this;
    /**
     * get uuid
     * @returns {string}
     */
    getUuid(): string;
    /**
     * get models constructors name as an object identifier
     * return {string}
     */
    getObjectIdentifier(): string;
    /**
     * set firebaseDatabase
     * @param {AngularFireDatabase}
     * @returns {PersistableModel}
     */
    setFirebaseDatabase(firebaseDatabase: any): this;
    /**
     * get firebase database
     * @returns {AngularFireDatabase}
     */
    getFirebaseDatabase(): AngularFireDatabase;
    /**
     * set firebase database path
     * @param path
     * @returns {PersistableModel}
     */
    setFirebaseDatabasePath(path: any): this;
    /**
     * get firebase database path
     * @returns {string}
     */
    getFirebaseDatabasePath(): string;
    /**
     * get firebase session data path
     * @param string path
     * @returns string
     */
    getFirebaseDatabaseSessionPath(path: string): string;
    /**
     * set firebaseDatabaseObject
     * @param firebaseDatabaseObject
     * @returns {PersistableModel}
     */
    setFirebaseDatabaseObject(firebaseDatabaseObject: any): this;
    /**
     * get firebaseDatabaseObject
     * @returns {AngularFireObject<any>}
     */
    getFirebaseDatabaseObject(): AngularFireObject<any>;
    /**
     * get firebaseDatabase prefix
     * @returns string
     */
    getFirebaseDatabaseRoot(): string;
    /**
     * set firebase databse path prefix
     * @param path
     * @returns {PersistableModel}
     */
    setFirebaseDatabaseRoot(path: any): this;
    /**
     * get property
     * @param string property
     * @returns {any}
     */
    getProperty(property: string): any;
    /**
     * get observer property for using as an binding variable
     * @returns {Observer<any>}
     */
    private getPropertyObserver(property);
    /**
     * set module provider messages
     * @param {AppsappModuleProviderMessages} messages
     * @returns {PersistableModel}
     */
    private setMessages(messages);
    /**
     * get modules providers message
     * @param keyword
     * @returns {any}
     */
    getMessage(keyword: any): any;
    /**
     * set property value for using as an binding variable
     * @param {string} property
     * @param {any} value
     * @returns {PersistableModel}
     */
    setProperty(property: any, value: any): this;
    /**
     * return current property value
     * @param property
     * @param {boolean} get value is in editing mode
     * @returns {any}
     */
    getPropertyValue(property: any, editing?: any): any;
    /**
     * get properties
     * @param stringify
     */
    getProperties(stringify?: any): {};
    /**
     * get properties keys
     * @param stringify
     */
    getPropertiesKeys(): any[];
    /**
     * get properties
     * @param stringify
     */
    convertListPropertiesFromArrayToObject(): this;
    /**
     * add a new list entry
     * @param property
     * @param data (json object, persistable model or array of those
     * @param uuid string
     * @returns {PersistableModel}
     */
    add(property: any, data?: any, uuid?: string): any;
    /**
     * remove a new list entry
     * @param property
     * @param uuidOrObject string or array set of string or PersistableModel or array set of PersistableModel
     * @returns this
     */
    remove(property: any, uuidOrObject?: any): this;
    /**
     * clear list entry
     * @returns this
     */
    clear(property: any): this;
    /**
     * return string representative from given property value
     * @param property
     * @param {boolean} get value is in editing mode
     * @returns {any}
     */
    __toString(property?: any): any;
    /**
     * set persistenceManager
     * @param persistenceManager
     * @returns {PersistableModel}
     */
    setPersistenceManager(persistenceManager: any): this;
    /**
     * valid this object
     * @param {boolean} softcheck
     * @returns {Promise<any>}
     */
    validate(softcheck?: any): Promise<{}>;
    /**
     * remove properties with invalid condition validators
     * @returns {PersistableModel}
     */
    private removeConditionProperties();
    /**
     * get validation observable for given property
     * @param {string} property
     * @return {boolean}
     */
    getValidation(property: any): any;
    /**
     * get condition observable for given property
     * @param property
     * @returns {Observable}
     */
    getCondition(property: any): any;
    /**
     * is the object/property on editing state
     * @param {string} property as an optional argument
     * @returns {boolean}
     */
    hasChanges(property?: any): number | boolean;
    /**
     * load json data
     * @param {object|string} stringified or real json object
     * @param clone boolean
     * @returns {Promise<any>}
     */
    loadJson(json: any, clone?: any): Promise<{}>;
    /**
     * transform type from metadata to avoid non matching data types
     * @param property
     * @param value
     * @returns {any}
     */
    private transformTypeFromMetadata(property, value);
    /**
     * transform type from metadata to avoid non matching data types
     * @param property
     * @param value
     * @returns {any}
     */
    private transformTypeFromMetadataExecute(property, value);
    /**
     * Transform all properties
     * @returns {PersistableModel}
     */
    transformAllProperties(): this;
    /**
     * Transform all properties by given type
     * @param type string
     * @returns {PersistableModel}
     */
    private transformAllPropertiesByType(type);
    /**
     * has model pending changes that are not synchronised yet or not
     * @returns {boolean}
     */
    hasPendingChanges(): boolean;
    /**
     * set pending changes state
     * @param {boolean} state
     * @param {any} action as an optional argument
     * @returns {PersistableModel}
     */
    setHasPendingChanges(state: any, action?: actionEmail | actionWebhook | actionGoogleSheets | actionCustom | string): this;
    /**
     * serialize this object
     * @param {boolean} noUnderScoreData
     * @param {boolean} force returning as an real object, otherwise return stringified object
     * @returns {any}
     */
    serialize(noUnderScoreData?: any, asObject?: any): any;
    /**
     * get the persistence manger
     * @returns {PersistenceManager}
     */
    getPersistenceManager(): any;
    /**
     * check if current network state is online
     * @returns {boolean}
     */
    isOnline(): boolean;
    /**
     * set if model is connected to internet
     * @param state
     */
    setIsOnline(state: any): this;
    /**
     * get properties metatadata
     * @param {string} property
     * @param {string} type
     * @returns {Array}
     */
    getMetadata(property?: string, type?: string): any;
    /**
     * check if property is type of array
     * @param property
     * @returns {boolean}
     */
    isArray(property: any): boolean;
    /**
     * get metadata contraints value
     * @param property
     * @param type
     * @param metadata
     * @param string constraints
     * @returns {any}
     */
    getMetadataValue(property?: any, type?: any, metadataInput?: any, constraints?: any): any;
    /**
     * resolves input type for given property
     * @param {string} property
     * @returns {any}
     */
    getType(property: any): any;
    /**
     * registers condition validators
     * @param {boolean} prepare
     * @returns {PersistableModel}
     */
    private registerConditionValidators(prepare);
    private calculateCircularCondition(property, chain, counter);
    /**
     *
     * @param property
     * @returns {PersistableModel}
     */
    private executeConditionValidatorCircular(property);
    /**
     *
     * @param property
     * @returns {PersistableModel}
     */
    private executeConditionValidator(property);
    /**
     * recovers a missing property
     * @param property
     * @returns {PersistableModel}
     */
    private recoverMissingProperty(property);
    /**
     * set notificationProvider
     * @param notificationProvider
     * @returns {PersistableModel}
     */
    private setNotificationProvider(notificationProvider);
    /**
     *
     * @param promise
     * @returns {PersistableModel}
     */
    private setIsLoadedPromise(promise);
    /**
     * get is loaded promise
     * @returns {Promise<any>}
     */
    private getIsLoadedPromise();
    /**
     * Is loaded promise
     * @returns {Promise}
     */
    loaded(): Promise<any>;
    /**
     * send notification message to user
     * @param message
     * @param error
     * @returns {PersistableModel}
     */
    notify(message: any, error?: any): this;
    /**
     * Get hased values
     * @Returns object
     */
    getHashedValues(): any[];
    /**
     * Set hased values
     * @Returns mixed
     */
    addHashedValue(value: any, hash: any): this;
    /**
     * Get value from hashed value
     * @param string hash
     * @Returns mixed
     */
    getHashedValue(hash: any): any;
    /**
     * Set hashed value
     * @param string value
     * @param hash
     * @Returns string hash
     */
    setHashedValue(value: any): any;
    /**
     * creates new lazy loaded persistable model
     * @param appsAppModuleProvider
     * @param constructor
     * @param uuid
     * @param data
     */
    private createNewLazyLoadedPersistableModel(appsAppModuleProvider, constructor, uuid?, data?);
    /**
     * set appsAppModuleProvider
     * @param appsAppModuleProvider
     * @returns {this}
     */
    private setAppsAppModuleProvider(appsAppModuleProvider);
    /**
     * set appsAppModuleProvider
     * @returns {any}
     */
    getAppsAppModuleProvider(): any;
    /**
     * set parent model
     * @param parentModel
     * @returns {this}
     */
    setParent(parentModel: any): this;
    /**
     * get parent model
     * @returns {any}
     */
    getParent(): any;
    /**
     * get changes observerable
     * @returns {Observable<any>}
     */
    getChangesObserverable(): Observable<any>;
    /**
     * execute changes with callback
     * @param event
     * @returns {this}
     */
    private executeChangesWithCallback(event);
    /**
     * observe property
     * @param property
     * @param any callback
     * @returns {this}
     */
    watch(property: any, callback: any): this;
    /**
     * get changes with callback
     * @returns {this}
     */
    getChangesWithCallback(callback: any): this;
    /**
     * Check if model is initialized in backend mode
     * @returns {boolean}
     */
    isInBackendMode(): boolean;
    /**
     * Enable autosave mode
     * @returns {this}
     */
    autosave(): this;
    /**
     * check if model has errors or not
     * @returns {boolean}
     */
    isValid(): boolean;
    /**
     * create list array
     * @param property
     * @returns {any}
     */
    private createListArray(property, reset?);
    /**
     * refresh list array
     * @param property
     * @param property
     * @returns {any}
     */
    private refreshListArray(property, value?);
    /**
     * get properties
     * @param stringify
     */
    refreshAllListArrays(): this;
}
