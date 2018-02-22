"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var class_validator_1 = require("class-validator");
function HasName(validationOptions) {
    return function (object, propertyName) {
        class_validator_1.registerDecorator({
            name: "hasName",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'hasName' }],
            options: validationOptions,
            validator: {
                validate: function (value, args) {
                    return true;
                }
            }
        });
    };
}
exports.HasName = HasName;
