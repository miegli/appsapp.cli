'use strict';

const google = require('googleapis');
var sheets = google.sheets('v4');
var drive = google.drive('v3');
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
                    resource: config && config.spreadsheet && config.spreadsheet.permissions ? config.spreadsheet.permissions : {
                        role: 'reader',
                        type: 'anyone',
                    }
                }, function (err) {
                    if (err) {
                        console.log('The API returned an error: ' + err);
                    } else {
                        resolve({auth: auth, spreadsheet: response});
                    }
                });
            }

            sheets.spreadsheets.get({
                spreadsheetId: spreadsheetId,
                auth: auth,
                includeGridData: true
            }, function (err, response) {

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


function updateSheet(spreadsheet, data, auth, model, config) {


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
                var properties = model.getProperties();
                var knownRanges = {};
                var knownRangesStartColumnsIndex = {};
                var nextRowIndex = spreadsheet && spreadsheet.sheets && spreadsheet.sheets[0].data && spreadsheet.sheets[0].data[0].rowData ? spreadsheet.sheets[0].data[0].rowData.length : 1;

                namedRanges.forEach((namedRange) => {
                    if (properties[namedRange['namedRangeId']] !== undefined) {
                        knownRanges[namedRange['namedRangeId']] = namedRange;
                        knownRangesStartColumnsIndex[namedRange.range.startColumnIndex] = namedRange;
                    }
                });

                var columns = {}, newRangesStartColumnsIndex = Object.keys(knownRangesStartColumnsIndex).length;
                Object.keys(properties).forEach((property) => {


                    var rangeHeader = knownRanges[property] ? knownRanges[property].range : {
                        startRowIndex: 0,
                        endRowIndex: 0,
                        startColumnIndex: newRangesStartColumnsIndex,
                        endColumnIndex: newRangesStartColumnsIndex + 1
                    };

                    var rangeCell = knownRanges[property] ? knownRanges[property].range : {
                        startRowIndex: nextRowIndex,
                        endRowIndex: nextRowIndex,
                        startColumnIndex: newRangesStartColumnsIndex,
                        endColumnIndex: newRangesStartColumnsIndex + 1
                    };

                    rangeCell.startRowIndex = nextRowIndex;
                    rangeCell.endRowIndex = nextRowIndex;

                    columns[rangeHeader.startColumnIndex] = {
                        property: property,
                        value: model.__toString(property),
                        type: model.getType(property),
                        title: model.getMetadataValue(property, 'hasLabel') ? model.getMetadataValue(property, 'hasLabel') : property,
                        rangeHeader: rangeHeader,
                        rangeCell: rangeCell,
                        namedRange: knownRanges[property] ? knownRanges[property].range : null
                    }

                    if (!knownRanges[property]) {
                        newRangesStartColumnsIndex++;
                    }

                });


                var columnsSorted = [];
                Object.keys(columns).sort().forEach((column) => {
                    columnsSorted.push(columns[column]);
                })

                resolve(columnsSorted);


            });


        });

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


        var namedRangesRequests = [];
        COLUMNS.forEach((column) => {

            if (!column.namedRange) {
                namedRangesRequests.push({
                    "addNamedRange": {
                        "namedRange": {
                            "namedRangeId": column.property,
                            "name": column.property,
                            "range": {
                                "sheetId": sheetId,
                                "startRowIndex": 0,
                                "endRowIndex": 1,
                                "startColumnIndex": column.rangeHeader.startColumnIndex,
                                "endColumnIndex": column.rangeHeader.endColumnIndex
                            }
                        }

                    }
                });
            } else {
                namedRangesRequests.push({
                    "updateNamedRange": {
                        "namedRange": {
                            "namedRangeId": column.property,
                            "name": column.property,
                            "range": {
                                "sheetId": sheetId,
                                "startRowIndex": 0,
                                "endRowIndex": 1,
                                "startColumnIndex": column.rangeHeader.startColumnIndex,
                                "endColumnIndex": column.rangeHeader.endColumnIndex
                            }
                        },
                        "fields": "range,name"

                    }
                });
            }


            namedRangesRequests.push({
                updateCells: {
                    start: {
                        sheetId: sheetId,
                        rowIndex: 0,
                        columnIndex: column.rangeHeader.startColumnIndex
                    },
                    rows: [
                        {
                            values: [{
                                userEnteredValue: {
                                    stringValue: column.title
                                },
                                userEnteredFormat: {
                                    textFormat: {
                                        bold: true
                                    }
                                }
                            }]
                        }
                    ],
                    fields: 'userEnteredValue,userEnteredFormat.textFormat.bold'
                }
            })


        });


        return namedRangesRequests;

    }

    var buildAddRowRequest = function (sheetId, COLUMNS) {

        var addRowRequest = [];

        COLUMNS.forEach((column) => {

            var value = {};

            switch (column.type) {

                case 'numberplain':
                    value = {
                        numberValue: column.value && column.value !== 'null' ? column.value : ''
                    };
                    break;

                default:
                    value = {
                        stringValue: column.value && column.value !== 'null' ? column.value : ''
                    };
            }


            addRowRequest.push({
                updateCells: {
                    start: {
                        sheetId: sheetId,
                        rowIndex: column.rangeCell.startRowIndex,
                        columnIndex: column.rangeCell.startColumnIndex
                    },
                    rows: [
                        {
                            values: [{
                                userEnteredValue: value,
                                userEnteredFormat: {
                                    textFormat: {
                                        bold: true
                                    }
                                }
                            }]
                        }
                    ],
                    fields: 'userEnteredValue'
                }
            })


        });


        return addRowRequest;

    }

    var buildSheetConfigRequest = function (config) {
        return [{
            "updateSpreadsheetProperties": {
                "properties": config && config.spreadsheet && config.spreadsheet.properties ? config.spreadsheet.properties : null,
                "fields": "title"
            }
        }]
    }

    return new Promise(function (resolve, reject) {


        getMergedColumns(spreadsheet, data, auth, model, config).then((COLUMNS) => {


            var requests = [];


            buildNamedRangeRequest(spreadsheet.sheets[0].properties.sheetId, COLUMNS).forEach((request) => {
                requests.push(request);
            });

            buildAddRowRequest(spreadsheet.sheets[0].properties.sheetId, COLUMNS).forEach((request) => {
                requests.push(request);
            });

            buildSheetConfigRequest(config).forEach((request) => {
                requests.push(request);
            });

            buildColumnsSizeRequest(spreadsheet.sheets[0].properties.sheetId, COLUMNS).forEach((request) => {
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


function googleSheets(action, data, config, model) {

    return new Promise(function (resolve, reject) {

        getSpreadsheet(config && config.spreadsheet && config.spreadsheet.spreadsheetId ? config.spreadsheet.spreadsheetId : 'newsheet', 'unbekannt', data, config).then((response) => {

            updateSheet(response.spreadsheet, config, response.auth, model, config).then((response) => {
                resolve({config: response, response: {state: 'done'}}); resolve(response);
            }).catch((err) => {
                reject(err);
            });


        }).catch((err) => {
            reject(err);
        });


    });

}

module.exports = googleSheets;



