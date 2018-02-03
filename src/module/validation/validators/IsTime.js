"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var class_validator_1 = require("class-validator");
function IsTime(options) {
    return function (object, propertyName) {
        class_validator_1.registerDecorator({
            name: "isTime",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'isTime', value: options }],
            validator: {
                validate: function (value, args) {
                    return true;
                }
            }
        });
    };
}
exports.IsTime = IsTime;
