export declare function IsCalendar(options?: {
    minDate?: Date;
    maxDate?: Date;
    display?: 'bubble' | 'center' | 'inline' | 'top' | 'bottom';
    controls?: ['date' | 'time'];
    steps?: {
        minute?: number;
        second?: number;
        zeroBased?: boolean;
    };
    invalid?: [any];
}): (object: Object, propertyName: string) => void;
