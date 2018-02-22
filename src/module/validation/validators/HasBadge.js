"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var class_validator_1 = require("class-validator");
function HasBadge(validationOptions) {
    return function (object, propertyName) {
        class_validator_1.registerDecorator({
            name: "hasBadge",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'hasBadge' }],
            options: validationOptions,
            validator: {
                validate: function (value, args) {
                    return true;
                }
            }
        });
    };
}
exports.HasBadge = HasBadge;
