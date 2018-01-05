import {registerDecorator, ValidationArguments} from "class-validator";
import {PersistableModel} from "../../models/persistable";

export function IsList(typeOfItems: any) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: "isList",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{'type': 'isList', 'value': typeOfItems}],
            validator: {
                validate(value: any, args: ValidationArguments) {

                    return new Promise(function (resolve, reject) {

                        let requiredValidations = value.length;
                        let proceededValidations = 0;
                        let allValide = true;

                        value.forEach((itemOriginal) => {

                            let item = null;

                            if (itemOriginal instanceof typeOfItems == false) {
                                try {
                                    item = typeOfItems !== undefined ? new typeOfItems() : new global[typeOfItems]();
                                    item.loadJson(itemOriginal).then().catch();
                                } catch (e) {
                                    item = new itemOriginal.constructor();
                                }

                            } else {
                                item = itemOriginal;
                            }

                            if (item.validate !== undefined && typeof item.validate == 'function') {
                                item.validate().then((isSuccess) => {
                                    // validation sucess, so resolve true
                                    proceededValidations++;
                                    if (proceededValidations >= requiredValidations) {
                                        resolve(allValide);
                                    }
                                }).catch((error) => {
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
