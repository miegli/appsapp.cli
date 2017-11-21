var CLI = require('clui');
var cmd = require('node-cmd');
var Spinner = CLI.Spinner;
const fs = require('fs-extra')
var path = require('path');
var files = require('../lib/files');
var chalk = require('chalk');
var cmd = require('node-cmd');
var Observable = require('rxjs/Observable').Observable;


config = function (program) {

    return new Promise(function (resolve, reject) {

        var status = new Spinner('Updating configuration, please wait...');
        status.start();
        var jobCount = 0;

        var o = new Observable(function (observer) {


            if (files.fileExists(files.getCurrentDirectory() + "/serviceAccountKey.json")) {
                var google = require(files.getCurrentDirectory() + "/serviceAccountKey.json");
                jobCount++;
                cmd.get(
                    'firebase functions:config:set google.client_email="' + google.client_email + '" google.private_key="' + google.private_key + '" ',
                    function (err, data, stderr) {
                        if (err) {
                            reject(err);
                        } else {
                            observer.next();
                        }
                    }
                );
            }

            if (files.fileExists(files.getCurrentDirectory() + "/amazonAccessKey.json")) {
                var amazon = require(files.getCurrentDirectory() + "/amazonAccessKey.json");
                jobCount++;
                cmd.get(
                    'firebase functions:config:set amazon.accesskeyid="' + amazon.accessKeyId + '" amazon.secretaccesskey="' + amazon.secretAccessKey + '" amazon.region="' + amazon.region + '" ',
                    function (err, data, stderr) {
                        if (err) {
                            reject(err);
                        } else {
                            observer.next();
                        }
                    }
                );
            }
        });


        var counter = 0;
        o.subscribe((next) => {
            "use strict";
            counter++;
            if (counter >= jobCount) {
                status.stop();
                resolve(chalk.green('Configuration successfully updated.'));
            }
        }, (err) => {
        }, (complete) => {
            "use strict";
            resolve('configuration updated');
        });

        if (jobCount == 0) {
            status.stop();
            resolve('configuration updated');
        }

    });

}


module.exports = config;