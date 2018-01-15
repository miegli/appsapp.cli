import { registerDecorator } from 'class-validator';
/**
 * @param {?=} length
 * @param {?=} validationOptions
 * @return {?}
 */
export function IsText(length, validationOptions) {
    return function (object, propertyName) {
        registerDecorator({
            name: "isText",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'isText', 'value': length }],
            options: validationOptions,
            validator: {
                /**
                 * @param {?} value
                 * @param {?} args
                 * @return {?}
                 */
                validate: function (value, args) {
                    return (!length || value.length < length ? true : false);
                }
            }
        });
    };
}
