"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var class_validator_1 = require("class-validator");
function IsNumpad(options, validationOptions) {
    return function (object, propertyName) {
        class_validator_1.registerDecorator({
            name: "isNumpad",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'isNumpad', 'value': options }],
            options: validationOptions,
            validator: {
                validate: function (value, args) {
                    return true;
                }
            }
        });
    };
}
exports.IsNumpad = IsNumpad;
