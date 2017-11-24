import {registerDecorator} from "class-validator";

export function IsPassword() {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: "isPassword",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{'type': 'isPassword'}],
            validator: {
                validate(value: any) {
                    return true;
                }
            }
        });
    };
}