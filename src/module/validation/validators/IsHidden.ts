import {registerDecorator, ValidationOptions, ValidationArguments} from "class-validator";
import {Observable} from "rxjs/Observable";
import {Validator} from "class-validator";

export function IsHidden(options: [{
    value?: any,
    property?: string,
    operand?: any,
    validator?: 'equals' | 'notEquals' | 'minLength' | 'maxLength' | 'matches' | 'isEmpty' | 'isNotEmpty' | 'isIn' | 'isNotIn' | 'isBoolean' | 'isDate' | 'isString' | 'isArray' | 'isNumber' | 'isInt' | 'isEnum' | 'isDivisibleBy' | 'isPositive' | 'isNegative' | 'max' | 'min' | 'minDate' | 'maxDate' | 'contains' | 'notContains' | 'isAlpha' | 'isAlphanumeric' | 'isAscii' | 'isBase64' | 'isCreditCard' | 'isCurrency' | 'isEmail' | 'isFQDN' | 'isHexColor' | 'isHexadecimal' | 'isIP' | 'isISBN' | 'isISIN' | 'isISO8601' | 'isJSON' | 'isLowercase' | 'isMobilePhone' | 'isURL' | 'isUUID' | 'isUppercase' | 'length' | 'isMilitaryTime' | 'arrayContains' | 'arrayNotContains' | 'arrayNotEmpty' | 'arrayMinSize' | 'arrayMaxSize' | 'arrayUnique',
    type?: 'condition'
    validatorAdditionalArgument?: any
}], validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {


        let self = this, actionIfMatches = true;

        if (options !== undefined) {

            options.forEach((option) => {

                if (option.property == undefined) {
                    option.property = propertyName;
                }
                if (option.validator == undefined) {
                    option.validator = 'equals';
                }
                if (option.type == undefined) {
                    option.type = 'condition';
                }
                if (option.value == undefined) {
                    option.value = true;
                }
            });
        }


        registerDecorator({
            name: "isHidden",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{'type': 'isHidden', 'value': options, 'actionIfMatches': actionIfMatches}],
            options: {groups: ['__isHidden__' + propertyName]},
            validator: {
                validate(value: any, args: any) {

                    const validator = new Validator();

                    let state = true;

                    /**
                     * iterates over all rules synchronous
                     */
                    if (options) {
                        options.forEach((condition: any) => {

                            if (state) {
                                if (condition.type == 'condition') {
                                    if (condition.validator == 'equals' && value !== undefined && value !== null && value.length !== undefined && value.length == 0) {
                                        state = true;
                                    } else {
                                        if (!validator[condition.validator](args.object.__conditionContraintsPropertiesValue[condition.property] === undefined ? args.object[condition.property] : args.object.__conditionContraintsPropertiesValue[condition.property], condition.value, condition.validatorAdditionalArgument)) {
                                            state = false;
                                        }
                                    }
                                }
                            }

                        });
                    }


                    /**
                     *  if is in backend service mode, so override property value and condition validator state
                     */
                    if (args.object.isInBackendMode()) {
                        return true;
                    }

                    return state;

                }
            }
        });


    };
}
