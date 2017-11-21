"use strict";
exports.__esModule = true;
var class_validator_1 = require("class-validator");
function IsText(length, validationOptions) {
    return function (object, propertyName) {
        class_validator_1.registerDecorator({
            name: "isText",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'isText', 'value': length }],
            options: validationOptions,
            validator: {
                validate: function (value, args) {
                    return (!length || value.length < length ? true : false);
                }
            }
        });
    };
}
exports.IsText = IsText;
