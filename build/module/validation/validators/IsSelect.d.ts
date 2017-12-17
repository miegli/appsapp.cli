export declare function IsSelect(options?: {
    source?: {
        url: string;
        mapping: {
            text: string | Function;
            value: string | Function;
            disabled?: boolean | Function;
            group?: string;
        };
        type?: 'json' | 'jsonp';
    };
    options?: [{
        value: any;
        disabled?: boolean;
        text: string;
        group?: string;
    }];
}): (object: Object, propertyName: string) => void;
