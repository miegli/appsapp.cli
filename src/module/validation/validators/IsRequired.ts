import {registerDecorator, ValidationOptions, ValidationArguments} from "class-validator";

export function IsRequired(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: "isRequired",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{'type': 'isRequired', 'value': true}],
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    return true;
                }
            }
        });
    };
}
