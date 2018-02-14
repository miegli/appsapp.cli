"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sql = require('mssql');
var rxjs_1 = require("rxjs");
var Mssql = /** @class */ (function () {
    function Mssql(dbo, connectionPool) {
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
        sql.connect(this.config, function (err) {
            if (err) {
                console.log(err);
            }
        });
    }
    Mssql.prototype.query = function (statement) {
        return new rxjs_1.Observable(function (observer) {
            var request = new sql.Request();
            request.stream = true;
            request.query(statement);
            request.on('row', function (row) {
                if (row['JSON_F52E2B61-18A1-11d1-B105-00805F49916B'] !== undefined) {
                    var json = row['JSON_F52E2B61-18A1-11d1-B105-00805F49916B'] ? JSON.parse(row['JSON_F52E2B61-18A1-11d1-B105-00805F49916B']) : null;
                    if (json) {
                        if ((typeof json.length == 'function' && json.length == 1) || (typeof json.length == 'number' && json.length == 1)) {
                            observer.next(json[0]);
                        }
                        else {
                            json.forEach(function (row) {
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
            request.on('error', function (err) {
                // May be emitted multiple times
                observer.error(err);
            });
            request.on('done', function (result) {
                // Always emitted as the last one
                observer.complete();
            });
        });
    };
    return Mssql;
}());
exports.Mssql = Mssql;
