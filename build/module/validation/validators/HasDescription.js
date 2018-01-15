import { registerDecorator } from 'class-validator';
/**
 * @param {?} description
 * @param {?=} validationOptions
 * @return {?}
 */
export function HasDescription(description, validationOptions) {
    return function (object, propertyName) {
        registerDecorator({
            name: "hasDescription",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'hasDescription', 'value': description }],
            options: validationOptions,
            validator: {
                /**
                 * @param {?} value
                 * @param {?} args
                 * @return {?}
                 */
                validate: function (value, args) {
                    return true;
                }
            }
        });
    };
}
