"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var class_validator_1 = require("class-validator");
function HasColor(color, validationOptions) {
    return function (object, propertyName) {
        class_validator_1.registerDecorator({
            name: "hasColor",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'hasColor', 'value': color }],
            options: validationOptions,
            validator: {
                validate: function (value, args) {
                    return true;
                }
            }
        });
    };
}
exports.HasColor = HasColor;
