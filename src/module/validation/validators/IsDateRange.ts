import {registerDecorator, ValidationOptions, ValidationArguments} from "class-validator";

export function IsDateRange(options?: {
  minDate?: Date
  maxDate?: Date,
  display?: 'bubble' | 'center' | 'inline' | 'top' | 'bottom',
  controls?: ['date' | 'time'],
  steps?: {
    minute?: number,
    second?: number,
    zeroBased?: boolean
  },
  invalid?: [any] /*
    '1/1', // 1st of January disabled
    '12/24', // Christmas disabled
    '12/25', // Christmas disabled
    'w0', // Sundays disabled
    { start: '00:00', end: '08:00' }, // Every day
    { start: '16:00', end: '23:59' }, // Every day
    { d: 'w6', start: '00:00', end: '08:59' }, // Saturday
    { d: 'w6', start: '17:00', end: '23:59' }, // Saturday
    new Date(2015,10,3), // exact date
    new Date(2016,6,11) // exact date
    */
}) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: "isDateRange",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [{'type': 'isDateRange', value: options}],
            validator: {
                validate(value: any, args: ValidationArguments) {
                   return true;
                }
            }
        });
    };
}
