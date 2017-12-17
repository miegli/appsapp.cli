import {registerDecorator, ValidationOptions, ValidationArguments} from "class-validator";
import {Observer} from "rxjs/Observer";
import {Observable} from "rxjs/Observable";
import * as Unirest from "unirest";

export function IsSelect(options?: {
    source?: {
        url: string,
        mapping: {
            text: string | Function,
            value: string | Function,
            disabled?: boolean | Function,
            group?: string
        },
        type?: 'json' | 'jsonp'
    },
    options?: [
        {
            value: any,
            disabled?: boolean,
            text: string,
            group?: string
        }]
}) {
    return function (object: Object, propertyName: string) {
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
                                return new Promise(function (resolve, reject) {
                                    console.log(optionValidator);
                                    if (optionValidator.source) {
                                        Unirest.get(optionValidator.source.url).type('json').end(function (response) {
                                            let options = [];
                                            console.log(response);
                                            if (response.error) {
                                                reject(response.error);
                                            } else {
                                                response.body.forEach((item) => {
                                                    options.push({
                                                        value: optionValidator._getPropertyFromObject(item, optionValidator.source.mapping.value),
                                                        text: optionValidator._getPropertyFromObject(item, optionValidator.source.mapping.text),
                                                        disabled: optionValidator.source.mapping.disabled !== undefined ? optionValidator._getPropertyFromObject(item, optionValidator.source.mapping.disabled) : false,
                                                    })
                                                });

                                                resolve(options);
                                            }
                                        });
                                    } else {
                                        resolve(args.constraints[0].value.options);
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

                            let allValide = true;
                            let values = {};
                            options.forEach((option) => {
                                if (!option.disabled) {
                                    values[option.value] = true;
                                }
                            });
                            optionValidator.target.forEach((value) => {
                                if (values[value] == undefined) {
                                    allValide = false;
                                }
                            });

                            resolve(allValide);

                        }).catch((error) => {
                            resolve(false);
                        });


                    });


                }
            }
        });
    };
}
