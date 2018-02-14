import { Observable } from 'rxjs';
export declare class Mssql {
    dbo: string;
    config: any;
    constructor(dbo: string, connectionPool: {
        user: string;
        password: string;
        server: string;
        database: string;
        options?: {
            trustedConnection?: boolean;
            instanceName?: string;
            requestTimeout?: number;
            idleTimeoutMillis?: number;
        };
    });
    query(statement: any): Observable<any>;
}
