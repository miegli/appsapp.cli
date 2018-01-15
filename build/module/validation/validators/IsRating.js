import { registerDecorator } from 'class-validator';
/**
 * @param {?=} options
 * @param {?=} validationOptions
 * @return {?}
 */
export function IsRating(options, validationOptions) {
    return function (object, propertyName) {
        registerDecorator({
            name: "isRating",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'isRating', 'value': options }],
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
