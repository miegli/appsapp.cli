import {registerDecorator, ValidationOptions, ValidationArguments} from "class-validator";

export function IsBirthDate(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "IsBirthDate",
      target: object.constructor,
      propertyName: propertyName,
      constraints: [{'type': 'isBirthDate', 'value': true}],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return true;
        }
      }
    });
  };
}
