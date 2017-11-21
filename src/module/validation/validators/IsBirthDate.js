"use strict";
exports.__esModule = true;
var class_validator_1 = require("class-validator");
function IsBirthDate(validationOptions) {
    return function (object, propertyName) {
        class_validator_1.registerDecorator({
            name: "IsBirthDate",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'isBirthDate', 'value': true }],
            options: validationOptions,
            validator: {
                validate: function (value, args) {
                    return true;
                }
            }
        });
    };
}
exports.IsBirthDate = IsBirthDate;
