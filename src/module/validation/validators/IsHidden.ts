import {registerDecorator, ValidationOptions, ValidationArguments} from "class-validator";

export function IsHidden(label: string, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "isHidden",
      target: object.constructor,
      propertyName: propertyName,
      constraints: [{'type': 'isHidden', 'value': label}],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return true;
        }
      }
    });
  };
}
