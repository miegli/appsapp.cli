import { registerDecorator } from 'class-validator';
/**
 * @param {?=} options
 * @return {?}
 */
export function IsSelect(options) {
    return function (object, propertyName) {
        registerDecorator({
            name: "isSelect",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'isSelect', value: options }],
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
