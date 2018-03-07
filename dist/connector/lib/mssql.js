"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sql = require('mssql');
const rxjs_1 = require("rxjs");
class Mssql {
    constructor(dbo, connectionPool) {
        this.dbo = dbo;
        this.config = {
            user: connectionPool.user,
            password: connectionPool.password,
            server: connectionPool.server,
            database: connectionPool.database,
            requestTimeout: connectionPool.options !== undefined && connectionPool.options.requestTimeout !== undefined ? connectionPool.options.requestTimeout : 300000,
            pool: {
                max: 1000,
                min: 0,
                idleTimeoutMillis: connectionPool.options !== undefined && connectionPool.options.idleTimeoutMillis !== undefined ? connectionPool.options.idleTimeoutMillis : 360
            }
        };
        sql.connect(this.config, err => {
            if (err) {
                console.log(err);
            }
        });
    }
    query(statement) {
        return new rxjs_1.Observable((observer) => {
            const request = new sql.Request();
            request.stream = true;
            request.query(statement);
            request.on('row', row => {
                if (row['JSON_F52E2B61-18A1-11d1-B105-00805F49916B'] !== undefined) {
                    let json = row['JSON_F52E2B61-18A1-11d1-B105-00805F49916B'] ? JSON.parse(row['JSON_F52E2B61-18A1-11d1-B105-00805F49916B']) : null;
                    if (json) {
                        if ((typeof json.length == 'function' && json.length == 1) || (typeof json.length == 'number' && json.length == 1)) {
                            observer.next(json[0]);
                        }
                        else {
                            json.forEach((row) => {
                                observer.next(row);
                            });
                        }
                    }
                    else {
                        observer.complete();
                    }
                }
                else {
                    observer.next(row);
                }
            });
            request.on('error', err => {
                // May be emitted multiple times
                observer.error(err);
            });
            request.on('done', result => {
                // Always emitted as the last one
                observer.complete();
            });
        });
    }
}
exports.Mssql = Mssql;
