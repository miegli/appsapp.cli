export declare function IsDateRange(options?: {
    minDate?: Date;
    maxDate?: Date;
    display?: 'bubble' | 'center' | 'inline' | 'top' | 'bottom';
    controls?: ['date' | 'time'];
    timeFormat?: string;
    steps?: {
        minute?: number;
        second?: number;
        zeroBased?: boolean;
    };
    invalid?: [any];
}): (object: Object, propertyName: string) => void;
