export declare function IsTime(options?: {
    display?: 'bubble' | 'center' | 'inline' | 'top' | 'bottom';
    timeFormat?: string;
    steps?: {
        minute?: number;
        second?: number;
        zeroBased?: boolean;
    };
    invalid?: [any];
}): (object: Object, propertyName: string) => void;
