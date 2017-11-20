#!/usr/bin/env node
var chalk = require('chalk');
var clear = require('clear');
var CLI = require('clui');
var path = require('path');
var figlet = require('figlet');
var gulp = require('gulp');
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
var program = require('commander');
var Progress = CLI.Progress;
var watch = require('node-watch');

clear();
console.log(
    chalk.yellow(
        figlet.textSync('appsApp', {horizontalLayout: 'full'})
    )
);




if (!files.fileExists(files.getCurrentDirectory() + "/serviceAccountKey.json")) {
    console.log(chalk.red('Error: ') + chalk('serviceAccountKey.json not found. Please add firebase credential file in ') + chalk.yellow(files.getCurrentDirectory()));
    process.exit(1);
}

if (!files.fileExists(files.getCurrentDirectory()+'/package.json')) {
    console.log(chalk.red('Error: ') + chalk('package.json not found. Please run appsapp from your project root directoriy.'));
    process.exit(1);
} else {
    var package = require(files.getCurrentDirectory()+'/package.json');
}

if (!files.fileExists(files.getCurrentDirectory()+'/.firebaserc')) {
    console.log(chalk.red('Error: ') + chalk('.firebaserc not found. Please run "firebase init" first and set a default project.'));
    process.exit(1);
} else {
    var workingDir = path.dirname(fs.realpathSync(__filename));
    var package = require(workingDir+'/../package.json');
}


program
    .version(package.version)
    .option('-p, --project [project]', 'set firebase project/id to use')
    .option('-w, --watch', 'watch for changes in source files and deploy backend functions automatically')
    .parse(process.argv);


var serviceAccount = require(files.getCurrentDirectory() + "/serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://" + serviceAccount.project_id + ".firebaseio.com"
});


var execute = function () {

    return new Observable(function (observer) {

        let jobs = {
            //compile: compile,
            //encryption: encryption,
            firebase: firebase
        }

        let successCount = 0;

        Object.keys(jobs).forEach((job) => {
            "use strict";

            jobs[job](program).then((next) => {
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



if (program.watch) {


    encryption(program).then((next) => {

        compile(program).then((next) => {
            console.log('Is watching now ..'+ files.getCurrentDirectory() + '/www/build/main.js');
        }).catch((error) => {
            console.log(error);
        });

    }).catch((error) => {
        console.log(error);
    });


    watch(files.getCurrentDirectory() + '/www/build/main.js', {recursive: true}, function (evt, name) {

        compile(program).then((next) => {

        }).catch((error) => {
            console.log(error);
        });

        encryption(program).then((next) => {

        }).catch((error) => {
            console.log(error);
        });

    });

} else {

    execute().subscribe((next) => {
      console.log(next);
    }, (err) => {
        console.log(err);
    }, (done) => {
        process.exit();
    });

}


// set firebase config
// firebase functions:config:set slack.url=https://hooks.slack.com/services/XXX



