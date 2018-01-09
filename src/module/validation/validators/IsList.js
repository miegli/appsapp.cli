"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var class_validator_1 = require("class-validator");
function IsList(typeOfItems, uniqueItems) {
    return function (object, propertyName) {
        class_validator_1.registerDecorator({
            name: "isList",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'isList', 'value': typeOfItems, 'uniqueItems': uniqueItems == undefined ? false : uniqueItems }],
            validator: {
                validate: function (value, args) {
                    return new Promise(function (resolve, reject) {
                        var requiredValidations = value.length;
                        var proceededValidations = 0;
                        var allValide = true;
                        value.forEach(function (itemOriginal) {
                            var item = null;
                            try {
                                // hint: global is used for backend node.js services
                                item = typeof global == 'undefined' ? new typeOfItems() : (typeof typeOfItems == 'string' && global[typeOfItems] !== undefined ? new global[typeOfItems]() : new typeOfItems());
                                item.loadJson(itemOriginal).then().catch();
                            }
                            catch (e) {
                                item = new itemOriginal.constructor();
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
