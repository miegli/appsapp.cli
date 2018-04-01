"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var class_validator_1 = require("class-validator");
function HasClearable(validationOptions) {
    return function (object, propertyName) {
        class_validator_1.registerDecorator({
            name: "hasClearable",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'hasClearable', 'value': true }],
            options: validationOptions,
            validator: {
                validate: function (value, args) {
                    return true;
                }
            }
        });
    };
}
exports.HasClearable = HasClearable;
