import {actionCustom, actionGoogleSheets, actionWebhook} from "./module/models/persistable";

export * from './module/models/persistable';
export * from './module/validation/validators/HasConditions';
export * from './module/validation/validators/HasDescription';
export * from './module/validation/validators/HasLabel';
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
export * from './module/interfaces/messages';
export * from 'class-validator/decorator/decorators'

export interface request {
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

