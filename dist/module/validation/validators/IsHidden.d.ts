import { ValidationOptions } from "class-validator";
export declare function IsHidden(options?: [{
    value?: any;
    property?: string;
    operand?: any;
    validator?: 'equals' | 'notEquals' | 'minLength' | 'maxLength' | 'matches' | 'isEmpty' | 'isNotEmpty' | 'isIn' | 'isNotIn' | 'isBoolean' | 'isDate' | 'isString' | 'isArray' | 'isNumber' | 'isInt' | 'isEnum' | 'isDivisibleBy' | 'isPositive' | 'isNegative' | 'max' | 'min' | 'minDate' | 'maxDate' | 'contains' | 'notContains' | 'isAlpha' | 'isAlphanumeric' | 'isAscii' | 'isBase64' | 'isCreditCard' | 'isCurrency' | 'isEmail' | 'isFQDN' | 'isHexColor' | 'isHexadecimal' | 'isIP' | 'isISBN' | 'isISIN' | 'isISO8601' | 'isJSON' | 'isLowercase' | 'isMobilePhone' | 'isURL' | 'isUUID' | 'isUppercase' | 'length' | 'isMilitaryTime' | 'arrayContains' | 'arrayNotContains' | 'arrayNotEmpty' | 'arrayMinSize' | 'arrayMaxSize' | 'arrayUnique';
    type?: 'condition';
    validatorAdditionalArgument?: any;
    additionalData?: any;
}], validationOptions?: ValidationOptions): (object: Object, propertyName: string) => void;
