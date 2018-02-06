import {registerDecorator, ValidationOptions, ValidationArguments} from "class-validator";

export function HasPlaceholder(label: string, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "hasPlaceholder",
      target: object.constructor,
      propertyName: propertyName,
      constraints: [{'type': 'hasPlaceholder', 'value': label}],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return true;
        }
      }
    });
  };
}
