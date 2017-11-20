import {registerDecorator, ValidationOptions, ValidationArguments} from "class-validator";

export function HasDescription(description: string, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "hasDescription",
      target: object.constructor,
      propertyName: propertyName,
      constraints: [{'type': 'hasDescription', 'value': description}],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return true;
        }
      }
    });
  };
}
