"use strict";
exports.__esModule = true;
var class_validator_1 = require("class-validator");
function IsCalendar(options) {
    return function (object, propertyName) {
        class_validator_1.registerDecorator({
            name: "isCalendar",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'isCalendar', value: options }],
            validator: {
                validate: function (value, args) {
                    return true;
                }
            }
        });
    };
}
exports.IsCalendar = IsCalendar;
