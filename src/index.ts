export * from './module/models/persistable';
export * from './module/validation/validators/HasConditions';
export * from './module/validation/validators/HasDescription';
export * from './module/validation/validators/HasLabel';
export * from './module/validation/validators/HasPlaceholder';
export * from './module/validation/validators/HasPrecision';
export * from './module/validation/validators/IsBirthDate';
export * from './module/validation/validators/IsCalendar';
export * from './module/validation/validators/IsDateRange';
export * from './module/validation/validators/IsPassword';
export * from './module/validation/validators/IsPhoneNumber';
export * from './module/validation/validators/IsRating';
export * from './module/validation/validators/IsText';
export * from './module/validation/validators/IsNumpad';
export * from './module/validation/validators/IsSelect';
export * from './module/validation/validators/IsList';
export * from './module/validation/validators/IsTime';
export * from './module/interfaces/messages';
export * from 'class-validator/decorator/decorators'
export * from './module/backend/connector';

export interface appRequest {
    user: string,
    object: string,
    objectId: string,
    project: string,
    action: {
        data: { name: string },
        name: 'custom',
        state: string
    },
    eventId: string
}

