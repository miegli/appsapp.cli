#!/usr/bin/env node
var chalk = require('chalk');
var clear = require('clear');
var CLI = require('clui');
var figlet = require('figlet');
var Spinner = CLI.Spinner;
var fs = require('fs');
var glob = require('glob');
var files = require('./lib/files');
var replace = require('replace-in-file');
var sha1 = require('sha1');
var admin = require("firebase-admin");


clear();
console.log(
    chalk.yellow(
        figlet.textSync('appsApp', {horizontalLayout: 'full'})
    )
);


if (!files.fileExists(files.getCurrentDirectory() + "/serviceAccountKey.json")) {
    console.log(chalk.red('Error: ') +chalk('/serviceAccountKey.json not found. Please add firebase credential file in ')+chalk.yellow(files.getCurrentDirectory()));
    process.exit(1);
}


var serviceAccount = require(files.getCurrentDirectory() + "/serviceAccountKey.json");

console.log();

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://"+serviceAccount.project_id+".firebaseio.com"
});




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



var replaceBuildFiles = function (src, callback) {
    glob(src + '/www/build/main.js', callback);
};
replaceBuildFiles(files.getCurrentDirectory(), function (err, res) {

    var status = new Spinner('Perform sha1 hash encryption for build files, please wait...');
    status.start();

    if (err || res.length == 0) {
        console.log('No build files found. Enter something linke "npm run" or "ionic serve" first.');
    } else {
        let replacements = executeAppsAppEncryption(res);

        if (Object.keys(replacements).length) {
            var db = admin.database();
            var ref = db.ref('_sha1');
            ref.set(replacements).then(() => {
                status.stop();
                console.log(chalk.green('Build encryption sucessfully done.'));
                process.exit(1);
            });
        } else {
            setTimeout(function() {
                status.stop();
                console.log(chalk.green('Sucessfully done. ')+ chalk('Nothing to do. There are no more replacements for encryption found. Add any {{{your-secure-string}}} to your *.ts files.'));
                status.stop();
               // process.exit(1);
            }, 2000);
        }

    }
});



