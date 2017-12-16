"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var class_validator_1 = require("class-validator");
function IsSelect(options) {
    return function (object, propertyName) {
        class_validator_1.registerDecorator({
            name: "isSelect",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'isSelect', value: options }],
            validator: {
                validate: function (value, args) {
                    return true;
                }
            }
        });
    };
}
exports.IsSelect = IsSelect;
