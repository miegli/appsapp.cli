"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var class_validator_1 = require("class-validator");
function IsList(typeOfItems) {
    return function (object, propertyName) {
        class_validator_1.registerDecorator({
            name: "isList",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'isList', 'value': typeOfItems }],
            validator: {
                validate: function (value, args) {
                    return true;
                }
            }
        });
    };
}
exports.IsList = IsList;
