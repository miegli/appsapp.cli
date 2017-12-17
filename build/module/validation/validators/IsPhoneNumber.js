import { registerDecorator } from 'class-validator';
/**
 * @param {?=} property
 * @param {?=} validationOptions
 * @return {?}
 */
export function IsPhoneNumber(property, validationOptions) {
    return function (object, propertyName) {
        registerDecorator({
            name: "isPhoneNumber",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'isPhoneNumber', 'value': property }],
            options: validationOptions,
            validator: {
                /**
                 * @param {?} value
                 * @param {?} args
                 * @return {?}
                 */
                validate: function (value, args) {
                    var /** @type {?} */ r = /[\\+ 0-9]/;
                    return r.test(value);
                }
            }
        });
    };
}
