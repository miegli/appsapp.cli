"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var class_validator_1 = require("class-validator");
function IsDateRange(options) {
    return function (object, propertyName) {
        class_validator_1.registerDecorator({
            name: "isDateRange",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'isDateRange', value: options }],
            validator: {
                validate: function (value, args) {
                    return true;
                }
            }
        });
    };
}
exports.IsDateRange = IsDateRange;
