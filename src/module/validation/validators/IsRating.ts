import {registerDecorator, ValidationOptions, ValidationArguments} from "class-validator";

export function IsRating(options?: {
  icon?: { filled: string, empty: string},
  values?: [any],
  style?: 'grade' | 'star',
  display?: 'bubble' | 'center' | 'inline' | 'top' | 'bottom'
}, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "isRating",
      target: object.constructor,
      propertyName: propertyName,
      constraints: [{'type': 'isRating', 'value': options}],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return true;
        }
      }
    });
  };
}
