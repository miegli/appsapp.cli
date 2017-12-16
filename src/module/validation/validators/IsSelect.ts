import {registerDecorator, ValidationOptions, ValidationArguments} from "class-validator";

export function IsSelect(options?: {
    source?: {
        url: string,
        mapping: {
            text: string,
            value: string,
            group?: string
        },
        type?: 'json' | 'jsonp'
    },
    options?: [
        {
            value: any,
            disabled?: boolean,
            text: string,
            group?: string
        }]
}) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: "isSelect",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{'type': 'isSelect', value: options}],
            validator: {
                validate(value: any, args: ValidationArguments) {
                    return true;
                }
            }
        });
    };
}
