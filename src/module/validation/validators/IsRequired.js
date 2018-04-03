"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var class_validator_1 = require("class-validator");
function IsRequired(validationOptions) {
    return function (object, propertyName) {
        class_validator_1.registerDecorator({
            name: "isRequired",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'isRequired', 'value': true }],
            options: validationOptions,
            validator: {
                validate: function (value, args) {
                    return value && value !== undefined ? true : false;
                }
            }
        });
    };
}
exports.IsRequired = IsRequired;
