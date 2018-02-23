export * from './connector';
export * from "./lib/mssql";
export * from "rxjs";
export interface Request {
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
export interface Executor {
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
}
