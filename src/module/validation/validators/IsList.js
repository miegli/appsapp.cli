"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var class_validator_1 = require("class-validator");
function IsList(typeOfItems, usePropertyAsUuid, uniqueItems) {
    return function (object, propertyName) {
        class_validator_1.registerDecorator({
            name: "isList",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{
                    'type': 'isList',
                    'value': typeOfItems,
                    'usePropertyAsUuid': usePropertyAsUuid,
                    'uniqueItems': uniqueItems == undefined ? false : uniqueItems
                }],
            validator: {
                validate: function (value, args) {
                    return new Promise(function (resolve, reject) {
                        var requiredValidations = value.length;
                        var proceededValidations = 0;
                        var allValide = true;
                        if (value.length == 0) {
                            resolve(true);
                        }
                        if (typeof value.forEach !== 'function') {
                            var tmp = [];
                            Object.keys(value).forEach(function (v) {
                                tmp.push(value[v]);
                            });
                            value = tmp;
                        }
                        value.forEach(function (itemOriginal) {
                            var item = null;
                            if (itemOriginal.__isPersistableModel) {
                                item = itemOriginal;
                                if (item.validate !== undefined && typeof item.validate == 'function') {
                                    item.validate().then(function (isSuccess) {
                                        // validation sucess, so resolve true
                                        proceededValidations++;
                                        if (proceededValidations >= requiredValidations) {
                                            resolve(allValide);
                                        }
                                    }).catch(function (error) {
                                        console.log(error);
                                        // validation error, so reject
                                        allValide = false;
                                        proceededValidations++;
                                        if (proceededValidations >= requiredValidations) {
                                            resolve(allValide);
                                        }
                                    });
                                }
                                else {
                                    // can't be validated, so resolve true
                                    proceededValidations++;
                                    if (proceededValidations >= requiredValidations) {
                                        resolve(allValide);
                                    }
                                }
                            }
                            else {
                                resolve(true);
                            }
                        });
                    });
                }
            }
        });
    };
}
exports.IsList = IsList;
