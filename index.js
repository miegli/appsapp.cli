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
var encryption = require("./actions/encrypt");
var compile = require("./actions/compile");
var firebase = require('./actions/firebase');
var Observable = require('rxjs/Observable').Observable;



clear();
console.log(
    chalk.yellow(
        figlet.textSync('appsApp', {horizontalLayout: 'full'})
    )
);

if (!files.fileExists(files.getCurrentDirectory() + "/serviceAccountKey.json")) {
    console.log(chalk.red('Error: ') + chalk('/serviceAccountKey.json not found. Please add firebase credential file in ') + chalk.yellow(files.getCurrentDirectory()));
    process.exit(1);
}

var serviceAccount = require(files.getCurrentDirectory() + "/serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://" + serviceAccount.project_id + ".firebaseio.com"
});





var execute = function () {

    return new Observable(function (observer) {

        let jobs = {
            compile: compile,
            encryption: encryption,
            firebase: firebase
        }

        let successCount = 0;


        Object.keys(jobs).forEach((job) => {
            "use strict";

            jobs[job]().then((next) => {
                successCount++;
                observer.next(next);
                if (Object.keys(jobs).length == successCount) {
                    observer.complete();
                }
            }).catch((error) => {
                console.log(error);
                process.exit();
            });

        });


    });

};

//
execute().subscribe((next) => {
   console.log(next);
}, (err) => {
    console.log(chalk.green(err));
}, (done) => {
    console.log(chalk.green('Done. '));
    process.exit();
});


// set firebase config
// firebase functions:config:set slack.url=https://hooks.slack.com/services/XXX

// firebase deploy --only functions



