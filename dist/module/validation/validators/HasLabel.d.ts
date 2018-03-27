import { ValidationOptions } from "class-validator";
export declare function HasLabel(label: string, labelPosition?: 'before' | 'after', validationOptions?: ValidationOptions): (object: Object, propertyName: string) => void;
