import {registerDecorator, ValidationOptions, ValidationArguments} from "class-validator";

export function HasColor(color: 'primary' | 'accent' | 'warn' | undefined, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "hasColor",
      target: object.constructor,
      propertyName: propertyName,
      constraints: [{'type': 'hasColor', 'value': color}],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return true;
        }
      }
    });
  };
}
