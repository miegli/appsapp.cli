"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var class_validator_1 = require("class-validator");
function IsHidden(label, validationOptions) {
    return function (object, propertyName) {
        class_validator_1.registerDecorator({
            name: "isHidden",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'isHidden', 'value': label }],
            options: validationOptions,
            validator: {
                validate: function (value, args) {
                    return true;
                }
            }
        });
    };
}
exports.IsHidden = IsHidden;
