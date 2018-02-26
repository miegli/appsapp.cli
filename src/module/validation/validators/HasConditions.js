"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var class_validator_1 = require("class-validator");
var class_validator_2 = require("class-validator");
function HasConditions(options, actionIfMatches, validationOptions) {
    return function (object, propertyName) {
        var self = this;
        if (actionIfMatches == undefined) {
            actionIfMatches = 'show';
        }
        options.forEach(function (option) {
            if (option.additionalData == undefined) {
                option.additionalData = {};
            }
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
            // rewrite nested properties
            if (option.property.indexOf('.') > 0) {
                option.additionalData.propertyNestedAsNestedObject = option.property;
                option.property = option.property.substr(0, option.property.indexOf('.'));
            }
        });
        var getNestedValue = function (property, value) {
            if (property.indexOf(".") > 0) {
                return value == undefined ? value : getNestedValue(property.substr(property.indexOf('.') + 1), value[property.substr(0, property.indexOf("."))]);
            }
            else {
                return value == undefined || value[property] == undefined ? undefined : value[property];
            }
        };
        class_validator_1.registerDecorator({
            name: "hasConditions",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'hasConditions', 'value': options, 'actionIfMatches': actionIfMatches }],
            options: { groups: ['condition_' + propertyName] },
            validator: {
                validate: function (value, args) {
                    var validator = new class_validator_2.Validator();
                    var state = true;
                    var valueNested = null;
                    /**
                     * iterates over all rules synchronous
                     */
                    if (value && options) {
                        options.forEach(function (condition) {
                            if (condition.additionalData.propertyNestedAsNestedObject !== undefined) {
                                valueNested = JSON.parse(JSON.stringify(args.object.__conditionContraintsPropertiesValue[condition.property]));
                                if (typeof valueNested == 'object' && valueNested.forEach !== undefined) {
                                    valueNested.forEach(function (v, i) {
                                        if (typeof v == 'string' && args.object.getHashedValue(v) !== v) {
                                            valueNested[i] = args.object.getHashedValue(v);
                                        }
                                        valueNested[i] = getNestedValue(condition.additionalData.propertyNestedAsNestedObject.substr(condition.additionalData.propertyNestedAsNestedObject.indexOf(".") + 1), valueNested[i]);
                                    });
                                }
                                if (typeof valueNested == 'string') {
                                    if (args.object.getHashedValue(valueNested) !== valueNested) {
                                        valueNested = args.object.getHashedValue(valueNested);
                                    }
                                    valueNested = getNestedValue(condition.additionalData.propertyNestedAsNestedObject.substr(condition.additionalData.propertyNestedAsNestedObject.indexOf(".") + 1), valueNested);
                                }
                                if (valueNested === null && condition.validator.indexOf('array') >= 0) {
                                    valueNested = [];
                                }
                            }
                            if (state) {
                                if (condition.type == 'condition') {
                                    if (valueNested === null && condition.validator == 'equals' && value !== undefined && value !== null && value.length !== undefined && value.length == 0) {
                                        state = true;
                                    }
                                    else {
                                        if (!validator[condition.validator](valueNested ? valueNested : (args.object.__conditionContraintsPropertiesValue[condition.property] === undefined ? args.object[condition.property] : args.object.__conditionContraintsPropertiesValue[condition.property]), condition.value, condition.validatorAdditionalArgument)) {
                                            state = false;
                                        }
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
exports.HasConditions = HasConditions;
