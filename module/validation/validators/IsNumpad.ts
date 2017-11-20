import {registerDecorator, ValidationOptions, ValidationArguments} from "class-validator";

export function IsNumpad(options?: {
  display?: 'bubble' | 'center' | 'inline' | 'top' | 'bottom'
}, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "isNumpad",
      target: object.constructor,
      propertyName: propertyName,
      constraints: [{'type': 'isNumpad', 'value': options}],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return true;
        }
      }
    });
  };
}
