import { ValidationOptions } from "class-validator";
export declare function HasColor(color: 'primary' | 'accent' | 'warn' | undefined, validationOptions?: ValidationOptions): (object: Object, propertyName: string) => void;
