"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var class_validator_1 = require("class-validator");
function HasIcon(validationOptions) {
    return function (object, propertyName) {
        class_validator_1.registerDecorator({
            name: "hasIcon",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'hasIcon' }],
            options: validationOptions,
            validator: {
                validate: function (value, args) {
                    return true;
                }
            }
        });
    };
}
exports.HasIcon = HasIcon;
