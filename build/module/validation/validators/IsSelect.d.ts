export declare function IsSelect(options?: {
    source?: {
        url: string;
        mapping: {
            text: string;
            value: string;
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
