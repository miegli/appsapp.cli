import {registerDecorator, ValidationOptions, ValidationArguments} from "class-validator";

export function HasIcon(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "hasIcon",
      target: object.constructor,
      propertyName: propertyName,
      constraints: [{'type': 'hasIcon'}],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return true;
        }
      }
    });
  };
}
