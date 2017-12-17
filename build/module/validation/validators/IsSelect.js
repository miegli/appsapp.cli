import { registerDecorator } from 'class-validator';
import * as Unirest from 'unirest';
/**
 * @param {?=} options
 * @return {?}
 */
export function IsSelect(options) {
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
                                return new Promise(function (resolve, reject) {
                                    if (optionValidator.source) {
                                        Unirest.get(optionValidator.source.url).type('json').end(function (response) {
                                            var /** @type {?} */ options = [];
                                            if (response.error) {
                                                reject(response.error);
                                            }
                                            else {
                                                response.body.forEach(function (item) {
                                                    options.push({
                                                        value: optionValidator._getPropertyFromObject(item, optionValidator.source.mapping.value),
                                                        text: optionValidator._getPropertyFromObject(item, optionValidator.source.mapping.text),
                                                        disabled: optionValidator.source.mapping.disabled !== undefined ? optionValidator._getPropertyFromObject(item, optionValidator.source.mapping.disabled) : false,
                                                    });
                                                });
                                                resolve(options);
                                            }
                                        });
                                    }
                                    else {
                                        resolve(args.constraints[0].value.options);
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
                                    values[option.value] = true;
                                }
                            });
                            optionValidator.target.forEach(function (value) {
                                if (values[value] == undefined) {
                                    allValide = false;
                                }
                            });
                            resolve(allValide);
                        }).catch(function (error) {
                            resolve(false);
                        });
                    });
                }
            }
        });
    };
}
