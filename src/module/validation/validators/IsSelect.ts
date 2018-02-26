import {registerDecorator, ValidationOptions, ValidationArguments} from "class-validator";
import {Observer} from "rxjs/Observer";
import {Observable} from "rxjs/Observable";
import * as Unirest from "unirest";
import * as objectHash from 'object-hash';

export function IsSelect(options?: {
    source?: {
        url: string,
        mapping: {
            text: string | Function,
            value?: string | Function,
            disabled?: boolean | Function,
            group?: string
        },
        type?: 'json' | 'jsonp'
    },
    display?: 'bubble' | 'center' | 'inline' | 'top' | 'bottom',
    options?: [
        {
            value: any,
            disabled?: boolean,
            text: string,
            group?: string
        }]
}) {
    return function (object: any, propertyName: string) {
        registerDecorator({
            name: "isSelect",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{'type': 'isSelect', value: options}],
            validator: {
                validate(value: any, args: ValidationArguments) {

                    return new Promise(function (resolve, reject) {

                        let optionValidator = {
                            target: value,
                            source: args.constraints[0].value.source,
                            getOptions: () => {
                                return new Promise(function (resolveOptions, rejectOptions) {
                                    if (optionValidator.source) {


                                        if (optionValidator.source.url.substr(0, 4) == 'http') {

                                            Unirest.get(optionValidator.source.url).type('json').end(function (response) {
                                                let options = [];
                                                if (response.error) {
                                                    rejectOptions(response.error);
                                                } else {
                                                    response.body.forEach((item) => {
                                                        options.push({
                                                            value: optionValidator.source.mapping.value !== null && optionValidator.source.mapping.value !== undefined ? optionValidator._getPropertyFromObject(item, optionValidator.source.mapping.value) : item,
                                                            text: optionValidator._getPropertyFromObject(item, optionValidator.source.mapping.text),
                                                            disabled: optionValidator.source.mapping.disabled !== undefined ? optionValidator._getPropertyFromObject(item, optionValidator.source.mapping.disabled) : false,
                                                        })
                                                    });
                                                    resolveOptions(options);
                                                }
                                            });

                                        } else if (optionValidator.source.url.substr(0, 1) == '/') {

                                            resolveOptions([]);

                                        } else {
                                            resolveOptions([]);
                                        }


                                    } else {
                                        resolveOptions(args.constraints[0].value.options);
                                    }
                                });
                            },

                            _getPropertyFromObject: (inputObject, property) => {

                                if (typeof property == 'function') {
                                    return inputObject !== undefined ? property(inputObject) : null;
                                }

                                if (property.indexOf(".") > 0) {
                                    return optionValidator._getPropertyFromObject(inputObject[property.substr(0, property.indexOf("."))], property.substr(property.indexOf(".") + 1));
                                } else {
                                    return inputObject[property];
                                }

                            }
                        }

                        optionValidator.getOptions().then((options: any) => {

                            if (options.length == 0) {
                                resolve(true);
                            }

                            let allValide = true;
                            let values = {};

                            options.forEach((option) => {
                                if (!option.disabled) {
                                    values[typeof option.value == 'object' ? objectHash.sha1(option.value) : option.value] = true;
                                }
                            });

                            if (typeof optionValidator.target.forEach == 'function') {
                                optionValidator.target.forEach((value) => {
                                    if (values[typeof value == 'object' ? objectHash.sha1(value) : value] == undefined) {
                                        allValide = false;
                                    }
                                });
                            }

                            if (allValide) {
                                resolve(true);
                            } else {
                                resolve(false);
                            }


                        }).catch((error) => {
                            console.log(error);
                            resolve(false);
                        });


                    });


                }
            }
        });
    };
}
