"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var class_validator_1 = require("class-validator");
var Unirest = require("unirest");
var objectHash = require("object-hash");
function IsSelect(options) {
    return function (object, propertyName) {
        class_validator_1.registerDecorator({
            name: "isSelect",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'isSelect', value: options }],
            validator: {
                validate: function (value, args) {
                    return new Promise(function (resolve, reject) {
                        var optionValidator = {
                            target: value,
                            source: args.constraints[0].value.source,
                            getOptions: function () {
                                return new Promise(function (resolveOptions, rejectOptions) {
                                    if (optionValidator.source) {
                                        if (optionValidator.source.url.substr(0, 4) == 'http') {
                                            Unirest.get(optionValidator.source.url).type('json').end(function (response) {
                                                var options = [];
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
                            }
                            var allValide = true;
                            var values = {};
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
exports.IsSelect = IsSelect;
