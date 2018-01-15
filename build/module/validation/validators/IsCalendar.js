import { registerDecorator } from 'class-validator';
/**
 * @param {?=} options
 * @return {?}
 */
export function IsCalendar(options) {
    return function (object, propertyName) {
        registerDecorator({
            name: "isCalendar",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'isCalendar', value: options }],
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
