"use strict";
exports.__esModule = true;
var class_validator_1 = require("class-validator");
function HasPrecision(precision, validationOptions) {
    return function (object, propertyName) {
        class_validator_1.registerDecorator({
            name: "hasPrecision",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'hasPrecision', 'value': precision }],
            options: validationOptions,
            validator: {
                validate: function (value, args) {
                    return true;
                }
            }
        });
    };
}
exports.HasPrecision = HasPrecision;
