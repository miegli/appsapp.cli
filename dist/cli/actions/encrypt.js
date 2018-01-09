var chalk = require('chalk');
var clear = require('clear');
var CLI = require('clui');
var figlet = require('figlet');
var Spinner = CLI.Spinner;
var fs = require('fs');
var glob = require('glob');
var files = require('../lib/files');
var replace = require('replace-in-file');
var sha1 = require('sha1');
var admin = require("firebase-admin");



var executeAppsAppEncryption = function (files) {


    var replacements = {};

    const options = {
        files: files,
        from: /\{\{\{[^}]+?\}\}\}/mg,
        to: (data) => {

            var hash = sha1(data);

            replacements[hash] = data.substr(3,data.length-6);

            return '{sha1://' + hash + '}';

        },
    };

    try {
        const changes = replace.sync(options);
    }
    catch (error) {
        console.error('Error occurred:', error);
    }


    return replacements;


};
encryption = function() {

    return new Promise(function (resolve, reject) {

        var replaceBuildFiles = function (callback) {
            glob(files.getBuildFile(), callback);
        };
        replaceBuildFiles(function (err, res) {


            var status = new Spinner('Perform sha1 hash encryption for build files, please wait...');
            status.start();

            if (err || res.length == 0) {
                status.stop();
                reject('No build files found. Enter something linke "npm run" or "ionic serve" or "ng build" first.');
            } else {
                let replacements = executeAppsAppEncryption(res);

                if (Object.keys(replacements).length) {
                    var db = admin.database();
                    var ref = db.ref('_sha1');
                    ref.set(replacements).then(() => {
                        status.stop();
                        resolve(chalk.green('Build encryption sucessfully done.'));
                    });
                } else {
                    setTimeout(function () {
                        status.stop();
                        resolve(chalk.green('Sucessfully done. ') + chalk('Nothing to do. There are no more replacements for encryption found. Add any new {{{your-secure-string}}} to your *.ts files.'));
                    }, 2000);
                }

            }
        });
    });


}

module.exports = encryption;