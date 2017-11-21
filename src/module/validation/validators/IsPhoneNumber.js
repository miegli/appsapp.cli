"use strict";
exports.__esModule = true;
var class_validator_1 = require("class-validator");
function IsPhoneNumber(property, validationOptions) {
    return function (object, propertyName) {
        class_validator_1.registerDecorator({
            name: "isPhoneNumber",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'isPhoneNumber', 'value': property }],
            options: validationOptions,
            validator: {
                validate: function (value, args) {
                    var r = /[\\+ 0-9]/;
                    return r.test(value);
                }
            }
        });
    };
}
exports.IsPhoneNumber = IsPhoneNumber;
