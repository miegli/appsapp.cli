"use strict";
exports.__esModule = true;
var class_validator_1 = require("class-validator");
function HasDescription(description, validationOptions) {
    return function (object, propertyName) {
        class_validator_1.registerDecorator({
            name: "hasDescription",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'hasDescription', 'value': description }],
            options: validationOptions,
            validator: {
                validate: function (value, args) {
                    return true;
                }
            }
        });
    };
}
exports.HasDescription = HasDescription;
