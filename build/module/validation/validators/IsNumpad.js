import { registerDecorator } from 'class-validator';
/**
 * @param {?=} options
 * @param {?=} validationOptions
 * @return {?}
 */
export function IsNumpad(options, validationOptions) {
    return function (object, propertyName) {
        registerDecorator({
            name: "isNumpad",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'isNumpad', 'value': options }],
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
