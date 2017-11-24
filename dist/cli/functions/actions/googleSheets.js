'use strict';

const google = require('googleapis');
var sheets = google.sheets('v4');
var drive = google.drive('v3');
var email = require('./email');
var jwtClient = null;
const functions = require('firebase-functions');


function authorize() {
    return new Promise(function (resolve, reject) {

        jwtClient = new google.auth.JWT(
            functions.config().google.client_email,
            null,
            functions.config().google.private_key,
            ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive'], // an array of auth scopes
            null
        );


        jwtClient.authorize(function (err, tokens) {

            if (err) {
                reject(error);
                return;
            }

            resolve(jwtClient);

        });

    });

}

function getSpreadsheet(spreadsheetId, title, data, config) {

    return new Promise(function (resolve, reject) {

        authorize().then((auth) => {


            var grantAndResolve = function (response, auth, resolve, reject) {

                drive.permissions.create({
                    auth: auth,
                    fileId: response.spreadsheetId,
                    resource: config.spreadsheet.permissions ? config.spreadsheet.permissions : {
                        role: 'reader',
                        type: 'anyone'
                    }
                }, function (err) {
                    if (err) {
                        console.log('The API returned an error: ' + err);
                    } else {
                        resolve({auth: auth, spreadsheet: response});
                    }
                });
            }

            sheets.spreadsheets.get({spreadsheetId: spreadsheetId, auth: auth}, function (err, response) {

                if (err) {
                    sheets.spreadsheets.create({
                        auth: auth,
                        resource: {
                            properties: {"title": title}
                        },
                    }, function (err, response) {
                        if (response && response.spreadsheetId) {
                            grantAndResolve(response, auth, resolve, reject);
                        } else {
                            reject(err);
                        }
                    });
                } else {

                    if (response && response.spreadsheetId) {
                        grantAndResolve(response, auth, resolve, reject);
                    } else {
                        reject(err);
                    }


                    resolve({auth: auth, spreadsheet: response});
                }

            });


        })

    });

}


function updateSheet(spreadsheet, data, auth, model) {


    var getMergedColumns = function (spreadsheet, data, auth, model) {

        return new Promise(function (resolve, reject) {

            var request = {
                // The spreadsheet to request.
                auth: auth,
                spreadsheetId: spreadsheet.spreadsheetId,
                resource: {
                    "dataFilters": [
                        {
                            "gridRange": {
                                "sheetId": 0,
                                "startColumnIndex": 0
                            }
                        }
                    ]

                }
            };

            sheets.spreadsheets.getByDataFilter(request, function (err, response) {

                if (err) {
                  reject(error);
                    return;
                }

                var namedRanges = response.namedRanges ? response.namedRanges : [];
                var knownRanges = {};

                namedRanges.forEach((namedRange) => {
                    knownRanges[namedRange['namedRangeId']] = namedRange;
                });

                console.log(model.getProperties());

                resolve([
                    {namedRangeId: '', title: 'ID'}
                ])


            });





        });

    }


    var buildHeaderRowRequest = function (sheetId, COLUMNS) {
        var cells = COLUMNS.map(function (column) {
            return {
                userEnteredValue: {
                    stringValue: column.title
                },
                userEnteredFormat: {
                    textFormat: {
                        bold: true
                    }
                }
            }
        });
        return [{
            updateCells: {
                start: {
                    sheetId: sheetId,
                    rowIndex: 0,
                    columnIndex: 0
                },
                rows: [
                    {
                        values: cells
                    }
                ],
                fields: 'userEnteredValue,userEnteredFormat.textFormat.bold'
            }
        }];
    }

    var buildColumnsSizeRequest = function (sheetId, COLUMNS) {

        return [{
            "autoResizeDimensions": {
                "dimensions": {
                    "sheetId": sheetId,
                    "dimension": "COLUMNS",
                    "startIndex": 0,
                    "endIndex": COLUMNS.length
                }
            }
        }]

    }

    var buildNamedRangeRequest = function (sheetId, COLUMNS) {

        console.log(COLUMNS);

        return [{
            "addNamedRange": {
                "namedRange": {
                    "namedRangeId": 'test',
                    "name": 'test',
                    "range": {
                        "sheetId": sheetId,
                        "startRowIndex": 0,
                        "endRowIndex": 1,
                        "startColumnIndex": 0,
                        "endColumnIndex": 1
                    }
                }

            }
        }]


    }

    var buildSheetConfigRequest = function (config) {
        return [{
            "updateSpreadsheetProperties": {
                "properties": config.spreadsheet && config.spreadsheet.properties ? config.spreadsheet.properties : null,
                "fields": "title"
            }
        }]
    }

    return new Promise(function (resolve, reject) {


        getMergedColumns(spreadsheet, data, auth, model).then((COLUMNS) => {


            var requests = [];

            buildHeaderRowRequest(spreadsheet.sheets[0].properties.sheetId, COLUMNS).forEach((request) => {
                requests.push(request);
            });

            buildColumnsSizeRequest(spreadsheet.sheets[0].properties.sheetId,COLUMNS).forEach((request) => {
                requests.push(request);
            });

            buildNamedRangeRequest(spreadsheet.sheets[0].properties.sheetId, COLUMNS).forEach((request) => {
                requests.push(request);
            });

            buildSheetConfigRequest(config).forEach((request) => {
                requests.push(request);
            });


            sheets.spreadsheets.batchUpdate({
                auth: auth,
                spreadsheetId: spreadsheet.spreadsheetId,
                resource: {
                    "requests": requests
                }
            }, (err, res) => {
                if (!err) {
                    resolve(spreadsheet);
                } else {
                    reject(err);
                }
            });

        });


    });
}

function addRow(spreadsheet, data, auth, model) {


    return new Promise(function (resolve, reject) {

            let cells = [];
            Object.keys(data).forEach((cell) => {


                let v = data[cell];
                if (typeof v !== 'string') {
                    v = JSON.stringify(v);
                }
                cells.push(v);
            });


            sheets.spreadsheets.values.append({

                    auth: auth,
                    spreadsheetId: spreadsheet.spreadsheetId,
                    range: 'A:A',
                    valueInputOption: 'USER_ENTERED',
                    insertDataOption: 'INSERT_ROWS',
                    resource: {
                        values: [cells]
                    }

                }

                ,
                (err, response) => {

                    if (err) {
                        console.log(`The API returned an error: ${err}`);
                        reject(err);
                    } else {
                        resolve(spreadsheet.spreadsheetUrl);
                    }


                }
            )
            ;


        }
    );

}

function googleSheets(action, data, config, model) {

    return new Promise(function (resolve, reject) {

        getSpreadsheet(config && config.spreadsheet && config.spreadsheet.spreadsheetId ? config.spreadsheet.spreadsheetId : 'newsheet', 'unbekannt', data, config).then((response) => {


            updateSheet(response.spreadsheet, config, response.auth, model).then(() => {
                resolve(response.spreadsheet);
            }).catch((err) => {
                reject(err);
            });


        }).catch((err) => {
            console.log(err);
        });


    });

}


/**
 * Call an Apps Script function to list the folders in the user's root
 * Drive folder.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function callAppsScript(auth) {

    var scriptId = 'Md9vKYC1KJ-9u6L5uXLG2-j9dP388JtBJ';
    var script = google.script('v1');

    // Make the API request. The request object is included here as 'resource'.
    script.scripts.run({
        auth: auth,
        resource: {
            function: 'getFoldersUnderRoot'
        },
        scriptId: scriptId
    }, function (err, resp) {
        if (err) {
            // The API encountered a problem before the script started executing.
            console.log('The API returned an error: ' + err);
            return;
        }
        if (resp.error) {
            // The API executed, but the script returned an error.

            // Extract the first (and only) set of error details. The values of this
            // object are the script's 'errorMessage' and 'errorType', and an array
            // of stack trace elements.
            var error = resp.error.details[0];
            console.log('Script error message: ' + error.errorMessage);
            console.log('Script error stacktrace:');

            if (error.scriptStackTraceElements) {
                // There may not be a stacktrace if the script didn't start executing.
                for (var i = 0; i < error.scriptStackTraceElements.length; i++) {
                    var trace = error.scriptStackTraceElements[i];
                    console.log('\t%s: %s', trace.function, trace.lineNumber);
                }
            }
        } else {
            // The structure of the result will depend upon what the Apps Script
            // function returns. Here, the function returns an Apps Script Object
            // with String keys and values, and so the result is treated as a
            // Node.js object (folderSet).
            var folderSet = resp.response.result;
            if (Object.keys(folderSet).length == 0) {
                console.log('No folders returned!');
            } else {
                console.log('Folders under your root folder:');
                Object.keys(folderSet).forEach(function (id) {
                    console.log('\t%s (%s)', folderSet[id], id);
                });
            }
        }

    });
}


module.exports = googleSheets;


/**
 * test
 */

/**
 * constructor loader
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({__proto__: []} instanceof Array && function (d, b) {
            d.__proto__ = b;
        }) ||
        function (d, b) {
            for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        };
    return function (d, b) {
        extendStatics(d, b);

        function __() {
            this.constructor = d;
        }

        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length,
        r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
const base64 = require('base-64');
var config = {
    "constructor": "dmFyIHQ9bnVsbCxjb3JlXzEgPSBmdW5jdGlvbigpIHt9LCBhcHBzYXBwX21vZHVsZV8xID0gcmVxdWlyZSgiYXBwc2FwcC1jbGkvYXBwc2FwcC1jbGkudW1kIiksIGFwcHNhcHBfY2xpXzEgPSByZXF1aXJlKCJhcHBzYXBwLWNsaS9hcHBzYXBwLWNsaS51bWQiKTsKCmdsb2JhbC5teU1vZGVsID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKF9zdXBlcikgewogICAgX19leHRlbmRzKG15TW9kZWwsIF9zdXBlcik7CiAgICBmdW5jdGlvbiBteU1vZGVsKCkgewogICAgICAgIHZhciBfdGhpcyA9IF9zdXBlciAhPT0gbnVsbCAmJiBfc3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKSB8fCB0aGlzOwogICAgICAgIF90aGlzLnRleHQgPSAndGVzdCc7CiAgICAgICAgcmV0dXJuIF90aGlzOwogICAgfQogICAgX19kZWNvcmF0ZShbCiAgICAgICAgYXBwc2FwcF9jbGlfMS5Jc0ludCgpLCBhcHBzYXBwX21vZHVsZV8xLk1pbigxNSksIGFwcHNhcHBfbW9kdWxlXzEuSGFzTGFiZWwoJ051bW1lcicpLCBhcHBzYXBwX21vZHVsZV8xLk1heCg5NTAwKSwgYXBwc2FwcF9tb2R1bGVfMS5IYXNEZXNjcmlwdGlvbigncGxlYXNlIGVudGVyIGEgbnVtYmVyJyksCiAgICAgICAgX19tZXRhZGF0YSgiZGVzaWduOnR5cGUiLCBOdW1iZXIpCiAgICBdLCBteU1vZGVsLnByb3RvdHlwZSwgIm51bWJlciIsIHZvaWQgMCk7CiAgICBfX2RlY29yYXRlKFsKICAgICAgICBhcHBzYXBwX21vZHVsZV8xLkhhc0NvbmRpdGlvbnMoW3sgcHJvcGVydHk6ICdudW1iZXInLCB2YWx1ZTogNywgdmFsaWRhdG9yOiAnbWluJyB9XSksIGFwcHNhcHBfbW9kdWxlXzEuSGFzTGFiZWwoJ1lvdXIgdGV4dCBpcyBoZXJlJyksCiAgICAgICAgX19tZXRhZGF0YSgiZGVzaWduOnR5cGUiLCBTdHJpbmcpCiAgICBdLCBteU1vZGVsLnByb3RvdHlwZSwgInRleHQiLCB2b2lkIDApOwogICAgX19kZWNvcmF0ZShbCiAgICAgICAgYXBwc2FwcF9tb2R1bGVfMS5Jc0RhdGVSYW5nZSgpLAogICAgICAgIF9fbWV0YWRhdGEoImRlc2lnbjp0eXBlIiwgT2JqZWN0KQogICAgXSwgbXlNb2RlbC5wcm90b3R5cGUsICJkYXRlcmFuZ2UiLCB2b2lkIDApOwogICAgcmV0dXJuIG15TW9kZWw7Cn0oYXBwc2FwcF9jbGlfMS5QZXJzaXN0YWJsZU1vZGVsKSk7",
    "googleSheets": {
        "spreadsheet": {
            "permissions": {
                "role": "writer",
                "type": "anyone"
            },
            "properties": {
                "autoRecalc": "ON_CHANGE",
                "defaultFormat": {
                    "backgroundColor": {
                        "blue": 1,
                        "green": 1,
                        "red": 1
                    },
                    "padding": {
                        "bottom": 2,
                        "left": 3,
                        "right": 3,
                        "top": 2
                    },
                    "textFormat": {
                        "bold": false,
                        "fontFamily": "arial,sans,sans-serif",
                        "fontSize": 10,
                        "italic": false,
                        "strikethrough": false,
                        "underline": false
                    },
                    "verticalAlignment": "BOTTOM",
                    "wrapStrategy": "OVERFLOW_CELL"
                },
                "locale": "en_US",
                "timeZone": "Etc/GMT",
                "title": "unbekannt"
            },
            "sheets": [{
                "properties": {
                    "gridProperties": {
                        "columnCount": 26,
                        "rowCount": 1005
                    },
                    "index": 0,
                    "sheetId": 0,
                    "sheetType": "GRID",
                    "title": "Sheet1"
                }
            }],
            "spreadsheetId": "1ZEwIu4CLCiNQ5Df7DAxNiGgkODXFt_ReNzXC3wkwmGk",
            "spreadsheetUrl": "https://docs.google.com/spreadsheets/d/1ZEwIu4CLCiNQ5Df7DAxNiGgkODXFt_ReNzXC3wkwmGk/edit"
        }
    }
};
functions.config = function () {

    return {
        "amazon": {
            "key": "AKIAJUPRSZLJ7WAUVV6Q",
            "region": "eu-west-1",
            "accesskeyid": "AKIAJUPRSZLJ7WAUVV6Q",
            "secretaccesskey": "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",
            "secret": "Uf4tEBaiHzpJzfBgQmCqUHnLPx7j69oblxtBPvKQ"
        },
        "google": {
            "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCvgLtljT/b5OiO\nSmQAszO/87XSNlCo5t3Crgm3XkK22/jcWlkoi7XXGKVpXwj8jOQQ92QjocItqlkk\nmsJtCMnUb4t7f5vyPHCy0jSGVOeum3AKhFtzc08c2hCUjj7B8SKug0Fb0iOaQrRB\nulbWyv45LSmnbrRWzbs59LQg2e6cN30UD3Mf4lny1smgQxCxCuVyMMD9829MFiPg\nKIaDAwDudbh4gmURkzB17UktfVR4ORsdJ0iRIsvB6TCgZyjoM2b+kYfUX5IFo5Xe\n6O0wUpylrxUrIKPwX5zjJ5uWsFwZhks154joZYPOjBlw0CP3e5bPNjYjQ1WL0Bay\noDECciqDAgMBAAECggEAMZwcnOS0J/cJi+tYYGBHoRuFioIDA/OavSTQJ07UYfdF\nXhiF+nGfuclEPMh59FXpRCiCXJYlmx37q965VfP1hYDwdz0Huo4+NzY3Vb+bbB6R\nKc/nP/fY5al4pV2ePNlqedUtfQSmPr1bUfcYBAiGm2f6TdN708u9AHF9F4ozKmIG\nqoiI7rShdovxtyo/LkPiTpKi4kPhIK3YMcpxqRXJ5KdgStcsc2fhxV8HfJ9XjBJ9\ng8XHICftYko7T3waTj1fuPN5GkqJ3qfqFwa9hgqDFEpABvYO9EIzAjas7SGxTEh0\nfOzN3ni4APM97qf+Ui9c1YIwCLsaYbDb5prWm86vhQKBgQDpfZPs0fvIZ/NPBt94\n1HJXHeNO6/goY2vwYjU+DHTlx0NcFcx5SEHsdHGRBgIFz2aW83DdGZ17mgs7VKPw\nwKk1Puy1O9Q0oT3Qz6682bk5ZU0QjmA/FEZUxRXr26zlvrVR8xiFt+GahPVtZ+uh\nXUqgXNHZkwcPtEBCidh9mmpchQKBgQDAbAyUuIvaTYxazrrnB4Xp1oLHoXHQ6M2s\n/CRAKFkuLrCPzWRkn6t/+dENZnaSbZEcWHwyGyJupNXtlsdxosmBcallWszSe6aQ\nC2UaNeO88CyQA2rEW2b5Yte4uq4joP+Z999JdEnPfgqSY3K7xKdjszHomOXeiR27\njjFghrJ9ZwKBgHZ5l+OksOOBi33f+Oiws8vsiHh1V5f2ysBQtL9lRrOJJm7FSNmJ\nhpnag/2YVNJp6J5TrEMkSjp7cZOLYRw6RiGUajuTvhtubZVUrE97EndDJZVvCPs4\n6G7/Ch6BevughxSsCxdetITZTkdTYcahNcqlDn4eEokvZyPcGhOxlKKZAoGALtqg\nfZ4qP6/eW0Y3cIX+b6ASHDYNlsb5PgPvd8fbX0lzKLDknzPZ+MGFy/OFL8aKLRLG\nuxSsX7C3frDWQ69VzbU1gD6J3T7KogyEQ8uXdqwszaxnVQTEoDkXOh4KxRYw5vba\nYfJ0/pc8T8TzbRFHiRlbL737SyKsIL1Q/KYP1EUCgYEAjKvbSsHDz6vDMFya0+8T\n56VvsPAnRxEAEwDaAgxtR+RBr/Q2iWxs6uhzKTp1hZTWGp91GNRK0QgrSwOhhNy0\npamNGgc2f4s1L9/ksT9ad3kyrLg31fSsbXAZOzJX833dItmK2e3Ii9U/ZqAKgB8s\nPZuBrbPfqBXwrvGUGiCtQNA=\n-----END PRIVATE KEY-----\n",
            "client_email": "firebase-adminsdk-hc5a5@test-32b81.iam.gserviceaccount.com"
        }
    };

}


eval(base64.decode(config.constructor));

var model = new global['myModel'];
model.loadJson({number: 99, text: 'test'});


googleSheets('googleSheets', {text: 'test', number: 888}, config.googleSheets, model).then((data) => {


});

