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

build= function() {

    return new Promise(function (resolve, reject) {

        var status = new Spinner('Uploading build, please wait...');
        status.start();

        var buildFiles = function (src, callback) {
            glob(src + '/www/build/*.js', callback);
        };

        buildFiles(files.getCurrentDirectory(), function (err, res) {
            "use strict";
            let build = {};

            res.forEach((file) => {
                build[files.getBaseName(file).replace(".", "")] = fs.readFileSync(file).toString();
            });

            var db = admin.database();
            var ref = db.ref('_build');
            ref.set(build).then(() => {
                status.stop();
                resolve(chalk.green('Build sucessfully uploaded.'));
            });

        });

    });

}

module.exports = build;