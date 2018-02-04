import {registerDecorator, ValidationArguments} from "class-validator";
import {PersistableModel} from "../../models/persistable";

declare var global: any;

export function IsList(typeOfItems: any, usePropertyAsUuid?: string, uniqueItems?:boolean) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: "isList",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{'type': 'isList', 'value': typeOfItems, 'usePropertyAsUuid': usePropertyAsUuid, 'uniqueItems': uniqueItems == undefined ? false : uniqueItems}],
            validator: {
                validate(value: any, args: ValidationArguments) {

                    return new Promise(function (resolve, reject) {

                        let requiredValidations = value.length;
                        let proceededValidations = 0;
                        let allValide = true;

                        if (value.length == 0) {
                            resolve(true);
                        }

                        if (typeof value.forEach !== 'function') {
                            var tmp = [];
                            Object.keys(value).forEach((v) => {
                                tmp.push(value[v]);
                            });
                            value = tmp;
                        }

                        value.forEach((itemOriginal) => {

                            let item = null;


                            try {
                                // hint: global is used for backend node.js services
                                item = typeof global == 'undefined' ? new typeOfItems() : (typeof typeOfItems == 'string' && global[typeOfItems] !== undefined ? new global[typeOfItems]() : new typeOfItems());
                                item.loadJson(itemOriginal).then().catch();
                            } catch (e) {
                                item = new itemOriginal.constructor();
                            }


                            if (item.validate !== undefined && typeof item.validate == 'function') {
                                item.validate().then((isSuccess) => {
                                    // validation sucess, so resolve true
                                    proceededValidations++;
                                    if (proceededValidations >= requiredValidations) {
                                        resolve(allValide);
                                    }
                                }).catch((error) => {
                                    console.log(error);
                                    // validation error, so reject
                                    allValide = false;
                                    proceededValidations++;
                                    if (proceededValidations >= requiredValidations) {
                                        resolve(allValide);
                                    }
                                })
                            } else {
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
