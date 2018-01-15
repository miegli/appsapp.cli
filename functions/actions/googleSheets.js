'use strict';

const google = require('googleapis');
var sheets = google.sheets('v4');
var drive = google.drive('v3');
var jwtClient = null;
const functions = require('firebase-functions');
var email = require('./email');

/**
 * Authorize google JWT client by given cloud functions configuration
 * @returns {Promise}
 */
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

/**
 * Return with promise a google spreadsheet instance by given identifier, or create a new sheet and update configuration if given.
 * @param spreadsheetId
 * @param title
 * @param data
 * @param config
 * @returns {Promise}
 */
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

/**
 * Updates given spreedsheet by given configuration, raw data, auth and appsapp persistable model
 * @param spreadsheet
 * @param data
 * @param auth
 * @param model
 * @param config
 * @returns {Promise}
 */
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

                var columns = {},
                    newRangesStartColumnsIndex = spreadsheet && spreadsheet.sheets && spreadsheet.sheets[0].data && spreadsheet.sheets[0].data[0].rowData ? spreadsheet.sheets[0].data[0].rowData[0].values.length : namedRanges.length;

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

                console.log(columnsSorted);


            });


        });

    }

    /**
     * Prepare spreadsheet column sizes
     * @param sheetId
     * @param COLUMNS
     * @returns {[null]}
     */
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

    /**
     * Prepare spreadsheet range request.
     * @param sheetId
     * @param COLUMNS
     * @returns {Array}
     */
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

    /**
     * Build spreadsheets add row request.
     * @param sheetId
     * @param COLUMNS
     * @returns {Array}
     */
    var buildAddRowRequest = function (sheetId, COLUMNS) {

        var addRowRequest = [];

        COLUMNS.forEach((column) => {

            var value = {};

            switch (column.type) {

                case 'numberplain':
                    value = {
                        numberValue: column.value && column.value !== 'null' ? column.value : null
                    };
                    break;

                default:
                    value = {
                        stringValue: column.value && column.value !== 'null' ? column.value : null
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

    /**
     * Prepare spreadsheets config request
     * @param config
     * @returns {[null]}
     */
    var buildSheetConfigRequest = function (config) {
        return [{
            "updateSpreadsheetProperties": {
                "properties": config && config.spreadsheet && config.spreadsheet.properties ? config.spreadsheet.properties : null,
                "fields": "title"
            }
        }]
    }

    /**
     * execute the spreadsheets update methods
     */
    return new Promise(function (resolve, reject) {


        getMergedColumns(spreadsheet, data, auth, model, config).then((COLUMNS) => {

            var requests = [];


            if (data) {
                buildAddRowRequest(spreadsheet.sheets[0].properties.sheetId, COLUMNS).forEach((request) => {
                    requests.push(request);
                });
            } else {

                buildNamedRangeRequest(spreadsheet.sheets[0].properties.sheetId, COLUMNS).forEach((request) => {
                    requests.push(request);
                });

                buildSheetConfigRequest(config).forEach((request) => {
                    requests.push(request);
                });


            }

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

/**
 * Google spreadsheets main wrapper method.
 * @param action
 * @param data
 * @param config
 * @param model
 * @returns {Promise}
 */
function googleSheets(action, data, config, model) {

    return new Promise(function (resolve, reject) {

        getSpreadsheet(config && config.spreadsheet && config.spreadsheet.spreadsheetId ? config.spreadsheet.spreadsheetId : 'newsheet', 'unbekannt', data, config).then((response) => {

            updateSheet(response.spreadsheet, data, response.auth, model, config).then((spreadsheet) => {


                if (action.action && action.action.data && action.action.data.to) {

                    action.action.data.template = spreadsheet.spreadsheetUrl;

                    if (action.action.data.to) {
                        email(action, data).then(() => {
                            resolve({config: {spreadsheet: spreadsheet}, response: {state: 'done'}});
                        });
                    }

                } else {
                    resolve({config: {spreadsheet: spreadsheet}, response: {state: 'done'}});
                }


            }).catch((err) => {
                reject(err);
            });


        }).catch((err) => {
            reject(err);
        });


    });

}

module.exports = googleSheets;


