import {registerDecorator, ValidationArguments} from "class-validator";

export function IsList(typeOfItems:any) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "isList",
      target: object.constructor,
      propertyName: propertyName,
      constraints: [{'type': 'isList', 'value': typeOfItems}],
      validator: {
        validate(value: any, args: ValidationArguments) {
          return true;
        }
      }
    });
  };
}
