var CLI = require('clui');
var cmd=require('node-cmd');
var Spinner = CLI.Spinner;
const fs = require('fs-extra')
var path = require('path');
var files = require('../lib/files');
var chalk = require('chalk');
var cmd=require('node-cmd');

config = function (program) {

    return new Promise(function (resolve, reject) {

        var status = new Spinner('Updating configuration, please wait...');
        status.start();


        if (files.fileExists(files.getCurrentDirectory() + "/serviceAccountKey.json")) {
            var google = require(files.getCurrentDirectory() + "/serviceAccountKey.json");
            cmd.get(
                'firebase functions:config:set google.client_email="'+google.client_email+'" google.private_key="'+google.private_key+'" ',
                function(err, data, stderr){
                    if (err) {
                        reject(err);
                    }
                }
            );
        }

        if (files.fileExists(files.getCurrentDirectory() + "/amazonAccessKey.json")) {
            var amazon = require(files.getCurrentDirectory() + "/amazonAccessKey.json");
            cmd.get(
                'firebase functions:config:set amazon.key="'+amazon.accessKeyId+'" amazon.secret="'+amazon.secretAccessKey+'" amazon.region="'+amazon.region+'" ',
                function(err, data, stderr){
                    if (err) {
                        reject(err);
                    }
                }
            );
        }



    });

}


module.exports = config;

config(null).then(() => {
    "use strict";

});