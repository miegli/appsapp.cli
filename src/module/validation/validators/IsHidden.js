"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var class_validator_1 = require("class-validator");
var class_validator_2 = require("class-validator");
function IsHidden(options, validationOptions) {
    return function (object, propertyName) {
        var self = this, actionIfMatches = true;
        if (options !== undefined) {
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
        }
        class_validator_1.registerDecorator({
            name: "isHidden",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'isHidden', 'value': options, 'actionIfMatches': actionIfMatches }],
            options: { groups: ['__isHidden__' + propertyName] },
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
                                    if (condition.validator == 'equals' && value !== undefined && value !== null && value.length !== undefined && value.length == 0) {
                                        state = true;
                                    }
                                    else {
                                        if (!validator[condition.validator](args.object.__conditionContraintsPropertiesValue[condition.property] === undefined ? args.object[condition.property] : args.object.__conditionContraintsPropertiesValue[condition.property], condition.value, condition.validatorAdditionalArgument)) {
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
                    if (args.object.isInBackendMode()) {
                        return true;
                    }
                    return state;
                }
            }
        });
    };
}
exports.IsHidden = IsHidden;
