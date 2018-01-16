import { registerDecorator } from 'class-validator';
/**
 * @param {?=} options
 * @return {?}
 */
export function IsDateRange(options) {
    return function (object, propertyName) {
        registerDecorator({
            name: "isDateRange",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'isDateRange', value: options }],
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
