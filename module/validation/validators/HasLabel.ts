import {registerDecorator, ValidationOptions, ValidationArguments} from "class-validator";

export function HasLabel(label: string, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "hasLabel",
      target: object.constructor,
      propertyName: propertyName,
      constraints: [{'type': 'hasLabel', 'value': label}],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return true;
        }
      }
    });
  };
}
