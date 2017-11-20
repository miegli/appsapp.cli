let nodemailer = require('nodemailer');
let aws = require('aws-sdk');


function email(action, data) {
  return new Promise(function (resolve, reject) {


    // configure AWS SDK
    aws.config.update({
      "accessKeyId": 'AKIAIXHD4TILQQGMDFTQ',
      "secretAccessKey": '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',
      "region": "eu-west-1"
    });

// create Nodemailer SES transporter
    let transporter = nodemailer.createTransport({
      SES: new aws.SES({
        apiVersion: '2010-12-01'
      })
    });

// send some mail
    transporter.sendMail({
      from: action.action.data.from !== undefined ? action.action.data.from : 'info@appsapp.io',
      to: action.action.data.to !== undefined ? action.action.data.to : null,
      subject: action.action.data.subject !== undefined ? action.action.data.subject : 'Message',
      text: action.action.data.template ? action.action.data.template : JSON.stringify(data)
    }, (err, info) => {
      if (err == undefined) {
        resolve({config: true, response: {state: 'done', message: 'email sent'}});
      } else {
        reject(err);
      }
    });


  });


}

module.exports = email;

//
// email({
//   date: 1510911736140,
//   project: 'project',
//   object: 'Test',
//   objectid: '059b3129-4953-1a00-816e-c26aa442c715',
//   user: 'U3vMSLbEneW6WUBCEIqOo7YpV0B2',
//   action:
//     {
//       data: {to: 'michael.egli@phlu.ch', subject: 'testmail', from:'info@appsapp.io'},
//       name: 'email',
//       state: 'requested'
//     },
//   actionid: '55e3725ebb6bce9e52c3d30070941c782d974dfb',
//   source: 'database',
//   target: 'session/U3vMSLbEneW6WUBCEIqOo7YpV0B2/project/Test/059b3129-4953-1a00-816e-c26aa442c715'
// }, {anrede: 'fff'});
