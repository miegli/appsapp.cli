import { ValidationOptions } from "class-validator";
export declare function IsRating(options?: {
    icon?: {
        filled: string;
        empty: string;
    };
    values?: [any];
    style?: 'grade' | 'star';
    display?: 'bubble' | 'center' | 'inline' | 'top' | 'bottom';
}, validationOptions?: ValidationOptions): (object: Object, propertyName: string) => void;
