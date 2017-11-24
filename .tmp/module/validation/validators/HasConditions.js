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
                    return state;
                }
            }
        });
    };
}
exports.HasConditions = HasConditions;
