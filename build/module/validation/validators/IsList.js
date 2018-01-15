import { registerDecorator } from 'class-validator';
/**
 * @param {?} typeOfItems
 * @param {?=} uniqueItems
 * @return {?}
 */
export function IsList(typeOfItems, uniqueItems) {
    return function (object, propertyName) {
        registerDecorator({
            name: "isList",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'isList', 'value': typeOfItems, 'uniqueItems': uniqueItems == undefined ? false : uniqueItems }],
            validator: {
                /**
                 * @param {?} value
                 * @param {?} args
                 * @return {?}
                 */
                validate: function (value, args) {
                    return new Promise(function (resolve, reject) {
                        var /** @type {?} */ requiredValidations = value.length;
                        var /** @type {?} */ proceededValidations = 0;
                        var /** @type {?} */ allValide = true;
                        value.forEach(function (itemOriginal) {
                            var /** @type {?} */ item = null;
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
