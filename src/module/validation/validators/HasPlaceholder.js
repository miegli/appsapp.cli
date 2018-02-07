"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var class_validator_1 = require("class-validator");
function HasPlaceholder(label, validationOptions) {
    return function (object, propertyName) {
        class_validator_1.registerDecorator({
            name: "hasPlaceholder",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'hasPlaceholder', 'value': label }],
            options: validationOptions,
            validator: {
                validate: function (value, args) {
                    return true;
                }
            }
        });
    };
}
exports.HasPlaceholder = HasPlaceholder;
