'use strict';

const google = require('googleapis');
var sheets = google.sheets('v4');
var drive = google.drive('v3');

var email = require('./email');

var key = {
  "type": "service_account",
  "project_id": "test-32b81",
  "private_key_id": "63f028237cabc21e9f186e69febba0e091e4a2c5",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCvgLtljT/b5OiO\nSmQAszO/87XSNlCo5t3Crgm3XkK22/jcWlkoi7XXGKVpXwj8jOQQ92QjocItqlkk\nmsJtCMnUb4t7f5vyPHCy0jSGVOeum3AKhFtzc08c2hCUjj7B8SKug0Fb0iOaQrRB\nulbWyv45LSmnbrRWzbs59LQg2e6cN30UD3Mf4lny1smgQxCxCuVyMMD9829MFiPg\nKIaDAwDudbh4gmURkzB17UktfVR4ORsdJ0iRIsvB6TCgZyjoM2b+kYfUX5IFo5Xe\n6O0wUpylrxUrIKPwX5zjJ5uWsFwZhks154joZYPOjBlw0CP3e5bPNjYjQ1WL0Bay\noDECciqDAgMBAAECggEAMZwcnOS0J/cJi+tYYGBHoRuFioIDA/OavSTQJ07UYfdF\nXhiF+nGfuclEPMh59FXpRCiCXJYlmx37q965VfP1hYDwdz0Huo4+NzY3Vb+bbB6R\nKc/nP/fY5al4pV2ePNlqedUtfQSmPr1bUfcYBAiGm2f6TdN708u9AHF9F4ozKmIG\nqoiI7rShdovxtyo/LkPiTpKi4kPhIK3YMcpxqRXJ5KdgStcsc2fhxV8HfJ9XjBJ9\ng8XHICftYko7T3waTj1fuPN5GkqJ3qfqFwa9hgqDFEpABvYO9EIzAjas7SGxTEh0\nfOzN3ni4APM97qf+Ui9c1YIwCLsaYbDb5prWm86vhQKBgQDpfZPs0fvIZ/NPBt94\n1HJXHeNO6/goY2vwYjU+DHTlx0NcFcx5SEHsdHGRBgIFz2aW83DdGZ17mgs7VKPw\nwKk1Puy1O9Q0oT3Qz6682bk5ZU0QjmA/FEZUxRXr26zlvrVR8xiFt+GahPVtZ+uh\nXUqgXNHZkwcPtEBCidh9mmpchQKBgQDAbAyUuIvaTYxazrrnB4Xp1oLHoXHQ6M2s\n/CRAKFkuLrCPzWRkn6t/+dENZnaSbZEcWHwyGyJupNXtlsdxosmBcallWszSe6aQ\nC2UaNeO88CyQA2rEW2b5Yte4uq4joP+Z999JdEnPfgqSY3K7xKdjszHomOXeiR27\njjFghrJ9ZwKBgHZ5l+OksOOBi33f+Oiws8vsiHh1V5f2ysBQtL9lRrOJJm7FSNmJ\nhpnag/2YVNJp6J5TrEMkSjp7cZOLYRw6RiGUajuTvhtubZVUrE97EndDJZVvCPs4\n6G7/Ch6BevughxSsCxdetITZTkdTYcahNcqlDn4eEokvZyPcGhOxlKKZAoGALtqg\nfZ4qP6/eW0Y3cIX+b6ASHDYNlsb5PgPvd8fbX0lzKLDknzPZ+MGFy/OFL8aKLRLG\nuxSsX7C3frDWQ69VzbU1gD6J3T7KogyEQ8uXdqwszaxnVQTEoDkXOh4KxRYw5vba\nYfJ0/pc8T8TzbRFHiRlbL737SyKsIL1Q/KYP1EUCgYEAjKvbSsHDz6vDMFya0+8T\n56VvsPAnRxEAEwDaAgxtR+RBr/Q2iWxs6uhzKTp1hZTWGp91GNRK0QgrSwOhhNy0\npamNGgc2f4s1L9/ksT9ad3kyrLg31fSsbXAZOzJX833dItmK2e3Ii9U/ZqAKgB8s\nPZuBrbPfqBXwrvGUGiCtQNA=\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-hc5a5@test-32b81.iam.gserviceaccount.com",
  "client_id": "107608747246918564199",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://accounts.google.com/o/oauth2/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-hc5a5%40test-32b81.iam.gserviceaccount.com"
};

var jwtClient = new google.auth.JWT(
  key.client_email,
  null,
  key.private_key,
  ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive'], // an array of auth scopes
  null
);

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

function addRow(spreadsheet, data, auth) {

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


    getSpreadsheet(config && config.spreadsheet && config.spreadsheet.spreadsheetId ? config.spreadsheet.spreadsheetId : 'newsheet', 'unbekannt', data).then((response) => {

      let res = response;

      addRow(response.spreadsheet, data, response.auth).then(() => {

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


  });

}


module.exports = googleSheets;

//
// googleSheets({
//   date: 1510911736140,
//   project: 'project',
//   object: 'Test',
//   objectid: '059b3129-4953-1a00-816e-c26aa442c715',
//   user: 'U3vMSLbEneW6WUBCEIqOo7YpV0B2',
//   action:
//     {
//       name: 'googleSheets',
//       state: 'requested'
//     },
//   actionid: '55e3725ebb6bce9e52c3d30070941c782d974dfb',
//   source: 'database',
//   target: 'session/U3vMSLbEneW6WUBCEIqOo7YpV0B2/project/Test/059b3129-4953-1a00-816e-c26aa442c715'
// },{
//     "anrede" : "fsd",
//     "anzahlkinder" : 3,
//     "geburtsdatum" : "2016-11-16T23:00:00.000Z",
//     "kalender" : "2017-11-29T23:00:00.000Z",
//     "lieblingszahl" : 10.5,
//     "name" : "fsdfsd",
//     "ort" : "luzern",
//     "plz" : 3434,
//     "rating" : 4,
//     "strasse" : "fsdf",
//     "strasseNr" : "3fd",
//     "text" : "fsdfsdfsdf",
//     "vonbis" : [ "2017-11-24T23:00:00.000Z", "2017-11-26T22:59:59.999Z" ],
//     "vorname" : "fsdfsd"
//   }
//   ).then((response) => {
//   console.log(response);
// })
