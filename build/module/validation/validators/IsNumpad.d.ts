import { ValidationOptions } from "class-validator";
export declare function IsNumpad(options?: {
    display?: 'bubble' | 'center' | 'inline' | 'top' | 'bottom';
}, validationOptions?: ValidationOptions): (object: Object, propertyName: string) => void;
