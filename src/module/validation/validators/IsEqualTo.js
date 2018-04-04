"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var class_validator_1 = require("class-validator");
function IsEqualTo(property) {
    return function (object, propertyName) {
        class_validator_1.registerDecorator({
            name: "isEqualTo",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'isEqualTo' }],
            validator: {
                validate: function (value, args) {
                    var object = args.object;
                    return value === object[property];
                }
            }
        });
    };
}
exports.IsEqualTo = IsEqualTo;
