export * from './connector';
export * from "./lib/mssql";
export interface request {
    user: string;
    object: string;
    objectId: string;
    project: string;
    action: {
        data: {
            name: string;
            identifier: string;
            interval?: number;
            maxExecutions?: number;
            currentExecutions?: number;
        };
        name: 'custom';
        state: string;
    };
    eventId: string;
}
