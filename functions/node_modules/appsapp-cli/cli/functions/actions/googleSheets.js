'use strict';

const google = require('googleapis');
var sheets = google.sheets('v4');
var drive = google.drive('v3');
var email = require('./email');
var jwtClient =null;



function authorize() {
    return new Promise(function (resolve, reject) {

        jwtClient.authorize(function (err, tokens) {

            if (err) {
                reject(error);
                return;
            }

            resolve(jwtClient);

        });

    });

}

function getSpreadsheet(spreadsheetId, title, data) {

    return new Promise(function (resolve, reject) {

        authorize().then((auth) => {

            sheets.spreadsheets.get({spreadsheetId: spreadsheetId, auth: auth}, function (err, response) {

                if (err) {
                    sheets.spreadsheets.create({
                        auth: auth,
                        resource: {
                            properties: {"title": title}
                        },
                    }, function (err, response) {
                        if (response && response.spreadsheetId) {


                            // create headers
                            let cells = [];
                            Object.keys(data).forEach((cell) => {
                                cells.push(cell);
                            });

                            sheets.spreadsheets.values.append({

                                auth: auth,
                                spreadsheetId: response.spreadsheetId,
                                range: 'A:A',
                                valueInputOption: 'USER_ENTERED',
                                insertDataOption: 'INSERT_ROWS',
                                resource: {
                                    values: [cells]
                                }

                            }, (err, res) => {

                                if (err) {
                                    console.log(`The API returned an error: ${err}`);
                                    reject(err);
                                } else {

                                    // public share

                                    drive.permissions.create({
                                        auth: auth,
                                        fileId: response.spreadsheetId,
                                        resource: {
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


                            });


                        } else {
                            reject(err);
                        }
                    });
                } else {
                    resolve({auth: auth, spreadsheet: response});
                }

            });


        })

    });

}

function addRow(spreadsheet, data, auth, model) {

    return new Promise(function (resolve, reject) {

            let cells = [];
            Object.keys(data).forEach((cell) => {

                console.log(model.getType(cell),cell);

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


        if (config.client_email && config.private_key) {
            jwtClient = new google.auth.JWT(
                config.client_email,
                null,
                config.private_key,
                ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive'], // an array of auth scopes
                null
            );
        }

        if (jwtClient) {

            getSpreadsheet(config && config.spreadsheet && config.spreadsheet.spreadsheetId ? config.spreadsheet.spreadsheetId : 'newsheet', 'unbekannt', data).then((response) => {

                let res = response;

                addRow(response.spreadsheet, data, response.auth, model).then(() => {

                    if (action.action && action.action.data && action.action.data.to) {

                        action.action.data.template = res.spreadsheet.spreadsheetUrl;

                        if (action.action.data.to) {
                            email(action, data).then(() => {
                                resolve({config: {spreadsheet: res.spreadsheet}, response: {state: 'done'}});
                            });
                        }

                    } else {
                        resolve({config: {spreadsheet: res.spreadsheet}, response: {state: 'done'}});
                    }


                }).catch((err) => {
                    reject(err);
                })


            }).catch((err) => {
                console.log(err);
            });

        } else {
            reject('missing config.client_email & config.private_key for google auth jwt.');
        }


    });

}


module.exports = googleSheets;