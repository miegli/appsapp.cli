import {registerDecorator, ValidationOptions, ValidationArguments} from "class-validator";

export function HasBadge(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: "hasBadge",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{'type': 'hasBadge'}],
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    return true;
                }
            }
        });
    };
}
