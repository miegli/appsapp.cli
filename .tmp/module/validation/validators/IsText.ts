import {registerDecorator, ValidationOptions, ValidationArguments} from "class-validator";

export function IsText(length?: number, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "isText",
      target: object.constructor,
      propertyName: propertyName,
      constraints: [{'type': 'isText', 'value': length}],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return (!length || value.length < length ? true : false);
        }
      }
    });
  };
}
