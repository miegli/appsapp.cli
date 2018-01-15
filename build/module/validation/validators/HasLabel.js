import { registerDecorator } from 'class-validator';
/**
 * @param {?} label
 * @param {?=} validationOptions
 * @return {?}
 */
export function HasLabel(label, validationOptions) {
    return function (object, propertyName) {
        registerDecorator({
            name: "hasLabel",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'hasLabel', 'value': label }],
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
