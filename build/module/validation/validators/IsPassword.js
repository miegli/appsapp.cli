import { registerDecorator } from 'class-validator';
/**
 * @return {?}
 */
export function IsPassword() {
    return function (object, propertyName) {
        registerDecorator({
            name: "isPassword",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{ 'type': 'isPassword' }],
            validator: {
                /**
                 * @param {?} value
                 * @return {?}
                 */
                validate: function (value) {
                    return true;
                }
            }
        });
    };
}
