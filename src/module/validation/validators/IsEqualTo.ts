import {registerDecorator, ValidationArguments} from "class-validator";

export function IsEqualTo(property: string) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: "isEqualTo",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{'type': 'isEqualTo'}],
            validator: {
                validate(value: any, args: ValidationArguments) {
                    let object: any = args.object;
                    return value === object[property];
                }
            }
        });
    };
}