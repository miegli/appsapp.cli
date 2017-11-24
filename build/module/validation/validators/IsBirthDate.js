import { registerDecorator } from 'class-validator';
/**
 * @param {?=} validationOptions
 * @return {?}
 */
export function IsBirthDate(validationOptions) {
    return function (object, propertyName) {
        registerDecorator({
            name: "IsBirthDate",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'isBirthDate', 'value': true }],
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
