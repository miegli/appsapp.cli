import {registerDecorator, ValidationOptions, ValidationArguments} from "class-validator";
import {Observable} from "rxjs/Observable";
import {Validator} from "class-validator";

export function HasConditions(options: [{
    value?: any,
    property?: string,
    operand?: any,
    validator?: 'equals' | 'notEquals' | 'minLength' | 'maxLength' | 'matches' | 'isEmpty' | 'isNotEmpty' | 'isIn' | 'isNotIn' | 'isBoolean' | 'isDate' | 'isString' | 'isArray' | 'isNumber' | 'isInt' | 'isEnum' | 'isDivisibleBy' | 'isPositive' | 'isNegative' | 'max' | 'min' | 'minDate' | 'maxDate' | 'contains' | 'notContains' | 'isAlpha' | 'isAlphanumeric' | 'isAscii' | 'isBase64' | 'isCreditCard' | 'isCurrency' | 'isEmail' | 'isFQDN' | 'isHexColor' | 'isHexadecimal' | 'isIP' | 'isISBN' | 'isISIN' | 'isISO8601' | 'isJSON' | 'isLowercase' | 'isMobilePhone' | 'isURL' | 'isUUID' | 'isUppercase' | 'length' | 'isMilitaryTime' | 'arrayContains' | 'arrayNotContains' | 'arrayNotEmpty' | 'arrayMinSize' | 'arrayMaxSize' | 'arrayUnique',
    type?: 'condition' | 'limit'
    validatorAdditionalArgument?: any,
    additionalData?: any
}], actionIfMatches?: 'hide' | 'show', validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {


        let self = this;

        if (actionIfMatches == undefined) {
            actionIfMatches = 'show';
        }


        options.forEach((option) => {

            if (option.additionalData == undefined) {
                option.additionalData = {};
            }

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

            // rewrite nested properties
            if (option.property.indexOf('.') > 0) {

                option.additionalData.propertyNestedAsNestedObject = option.property;
                option.property = option.property.substr(0, option.property.indexOf('.'));

            }

        });


        var getNestedValue = (property, ovalue, model) => {

            let value = model.getHashedValue(ovalue);

            if (property.indexOf(".") > 0) {
                return value === undefined ? value : getNestedValue(property.substr(property.indexOf('.') + 1), value[property.substr(0, property.indexOf("."))], model);
            } else {
                return value === undefined || value[property] === undefined ? undefined : value[property];
            }




        }

        registerDecorator({
            name: "hasConditions",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{'type': 'hasConditions', 'value': options, 'actionIfMatches': actionIfMatches}],
            options: {groups: ['condition_' + propertyName]},
            validator: {
                validate(value: any, args: any) {

                    const validator = new Validator();

                    let state = true;
                    let valueNested = null;

                    /**
                     * iterates over all rules synchronous
                     */
                    if (options) {
                        options.forEach((condition: any) => {

                            if (condition.additionalData.propertyNestedAsNestedObject !== undefined) {

                                valueNested = args.object.getHashedValue(JSON.parse(JSON.stringify(args.object.__conditionContraintsPropertiesValue[condition.property])));

                                if (typeof valueNested == 'object' && valueNested.forEach !== undefined) {
                                    valueNested.forEach((v, i) => {
                                        valueNested[i] = getNestedValue(condition.additionalData.propertyNestedAsNestedObject.substr(condition.additionalData.propertyNestedAsNestedObject.indexOf(".") + 1), valueNested[i],args.object);
                                    });
                                }

                                if (typeof valueNested == 'string') {
                                    if (args.object.getHashedValue(valueNested) !== valueNested) {
                                        valueNested = args.object.getHashedValue(valueNested);
                                    }
                                    valueNested = getNestedValue(condition.additionalData.propertyNestedAsNestedObject.substr(condition.additionalData.propertyNestedAsNestedObject.indexOf(".") + 1), valueNested,args.object);
                                }

                                if (valueNested === null && condition.validator.indexOf('array') >= 0) {
                                    valueNested = [];
                                }
                            }


                            if (state) {

                                if (valueNested !== undefined && condition.type == 'condition') {
                                    if (valueNested === null && condition.validator == 'equals' && value !== undefined && condition.value !== null && condition.value.length !== undefined && value.length == 0) {
                                        state = true;
                                    } else {


                                        if (!validator[condition.validator](valueNested ? valueNested : (args.object.__conditionContraintsPropertiesValue[condition.property] === undefined ? args.object[condition.property] : args.object.__conditionContraintsPropertiesValue[condition.property]), condition.value, condition.validatorAdditionalArgument)) {
                                            state = false;
                                        }


                                    }
                                }
                            }

                        });
                    } else {
                        state = false;
                    }

                    /**
                     *  if is in backend service mode, so override property value and condition validator state
                     */
                    if (!state && args.object.isInBackendMode()) {
                        try {
                            delete args.object[args.property];
                        } catch (e) {
                            return false;
                        }
                        return true;
                    }

                    return state;

                }
            }
        });


    };
}
