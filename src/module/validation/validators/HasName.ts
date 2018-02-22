import {registerDecorator, ValidationOptions, ValidationArguments} from "class-validator";

export function HasName(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: "hasName",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{'type': 'hasName'}],
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    return true;
                }
            }
        });
    };
}
