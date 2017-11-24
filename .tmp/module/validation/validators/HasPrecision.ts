import {registerDecorator, ValidationOptions, ValidationArguments} from "class-validator";

export function HasPrecision(precision: number, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "hasPrecision",
      target: object.constructor,
      propertyName: propertyName,
      constraints: [{'type': 'hasPrecision', 'value': precision}],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return true;
        }
      }
    });
  };
}
