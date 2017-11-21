"use strict";
exports.__esModule = true;
var class_validator_1 = require("class-validator");
function IsPassword() {
    return function (object, propertyName) {
        class_validator_1.registerDecorator({
            name: "isPassword",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'isPassword' }],
            validator: {
                validate: function (value) {
                    return true;
                }
            }
        });
    };
}
exports.IsPassword = IsPassword;
