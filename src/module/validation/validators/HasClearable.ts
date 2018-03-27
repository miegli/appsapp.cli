import {registerDecorator, ValidationOptions, ValidationArguments} from "class-validator";

export function HasClearable(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "hasClearable",
      target: object.constructor,
      propertyName: propertyName,
      constraints: [{'type': 'hasClearable', 'value': true}],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return true;
        }
      }
    });
  };
}
