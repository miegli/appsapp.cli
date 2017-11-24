import { registerDecorator } from 'class-validator';
/**
 * @param {?} precision
 * @param {?=} validationOptions
 * @return {?}
 */
export function HasPrecision(precision, validationOptions) {
    return function (object, propertyName) {
        registerDecorator({
            name: "hasPrecision",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'hasPrecision', 'value': precision }],
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
