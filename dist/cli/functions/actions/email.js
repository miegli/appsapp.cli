let nodemailer = require('nodemailer');
let aws = require('aws-sdk');


function email(action, data, config) {
  return new Promise(function (resolve, reject) {


    // configure AWS SDK
    aws.config.update({
      "accessKeyId": config.accessKeyId,
      "secretAccessKey": config.secretAccessKey,
      "region": config.region
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