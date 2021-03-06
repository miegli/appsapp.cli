"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var class_validator_1 = require("class-validator");
function HasLabel(label, labelPosition, validationOptions) {
    return function (object, propertyName) {
        class_validator_1.registerDecorator({
            name: "hasLabel",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'hasLabel', 'value': { label: label, labelPosition: labelPosition ? labelPosition : 'after' } }],
            options: validationOptions,
            validator: {
                validate: function (value, args) {
                    return true;
                }
            }
        });
    };
}
exports.HasLabel = HasLabel;
