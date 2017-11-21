"use strict";
exports.__esModule = true;
var class_validator_1 = require("class-validator");
function IsRating(options, validationOptions) {
    return function (object, propertyName) {
        class_validator_1.registerDecorator({
            name: "isRating",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'isRating', 'value': options }],
            options: validationOptions,
            validator: {
                validate: function (value, args) {
                    return true;
                }
            }
        });
    };
}
exports.IsRating = IsRating;
