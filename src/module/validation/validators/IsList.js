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
                    return new Promise(function (resolve, reject) {
                        var requiredValidations = value.length;
                        var proceededValidations = 0;
                        var allValide = true;
                        value.forEach(function (itemOriginal) {
                            var item = null;
                            if (typeof itemOriginal == 'function' || itemOriginal instanceof typeOfItems == false) {
                                try {
                                    item = typeof global == 'undefined' ? new typeOfItems() : new global[typeOfItems]();
                                    item.loadJson(itemOriginal).then().catch();
                                }
                                catch (e) {
                                    item = new itemOriginal.constructor();
                                }
                            }
                            else {
                                item = itemOriginal;
                            }
                            if (item.validate !== undefined && typeof item.validate == 'function') {
                                item.validate().then(function (isSuccess) {
                                    // validation sucess, so resolve true
                                    proceededValidations++;
                                    if (proceededValidations >= requiredValidations) {
                                        resolve(allValide);
                                    }
                                }).catch(function (error) {
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
                        });
                    });
                }
            }
        });
    };
}
exports.IsList = IsList;
