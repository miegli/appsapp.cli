import {registerDecorator, ValidationOptions, ValidationArguments} from "class-validator";

export function IsPhoneNumber(property?: string, validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: "isPhoneNumber",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{'type': 'isPhoneNumber', 'value': property}],
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    let r = /[\\+ 0-9]/;
                    return r.test(value);
                }
            }
        });
    };
}
