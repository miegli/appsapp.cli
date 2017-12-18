#!/usr/bin/env node
var chalk = require('chalk');
var clear = require('clear');
var CLI = require('clui');
var figlet = require('figlet');
var files = require('./lib/files');
var admin = require("firebase-admin");
var encryption = require("./actions/encrypt");
var compile = require("./actions/compile");
var firebase = require('./actions/firebase');
var config = require('./actions/config');
var reset = require('./actions/reset');
var Observable = require('rxjs/Observable').Observable;
var program = require('commander');
var watch = require('node-watch');
var Spinner = CLI.Spinner;

clear();
console.log(
    chalk.yellow(
        figlet.textSync('appsApp', {horizontalLayout: 'full'})
    )
);


var package = require('./package.json');

program
    .version(package.version)
    .option('-p, --project [project]', 'set firebase project/id to use')
    .option('-w, --watch', 'watch for changes in source files and deploy backend functions automatically')
    .option('-r, --reset [model]', 'Clear config for all finishers for given model.')
    .parse(process.argv);



if (!files.fileExists(files.getCurrentDirectory() + "/serviceAccountKey.json")) {
    console.log(chalk.red('Error: ') + chalk('serviceAccountKey.json not found. Please add firebase credential file in ') + chalk.yellow(files.getCurrentDirectory()));
    process.exit(1);
}



if (!files.fileExists(files.getCurrentDirectory()+'/.firebaserc')) {
    console.log(chalk.red('Error: ') + chalk('.firebaserc not found. Please run "firebase init" first and set a default project.'));
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
            config: config,
            compile: compile,
            encryption: encryption,
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


if (program.reset) {

    reset(program).then((status) => {
        console.log(status);
        process.exit();
    });

    return;
}


if (program.watch) {


    encryption(program).then((next) => {

        compile(program).then((next) => {
            var status = new Spinner("Is watching " + files.getCurrentDirectory() + '/www/build/main.js');
            status.start();
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

    watch(files.getCurrentDirectory() + '/amazonAccessKey.json', {recursive: false}, function (evt, name) {

        config(program).then((next) => {

        }).catch((error) => {
            console.log(error);
        });

    });

    watch(files.getCurrentDirectory() + '/serviceAccountKey.json', {recursive: false}, function (evt, name) {

        config(program).then((next) => {

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



