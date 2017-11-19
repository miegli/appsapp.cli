var CLI = require('clui');
var Spinner = CLI.Spinner;
var fs = require('fs');
var glob = require('glob');
var files = require('../lib/files');
var gulp = require('gulp');
var ts = require("gulp-typescript");
var replace = require('replace-in-file');
var chalk = require('chalk');
var admin = require("firebase-admin");
var tsProject = ts.createProject("tsconfig.json", {target: 'node', module: "commonjs", noExternalResolve: false});
var Observable = require('rxjs/Observable').Observable;
const base64 = require('base-64');

build = function () {

    return new Promise(function (resolve, reject) {




        gulp.task("compile", function () {
            return tsProject.src()
                .pipe(tsProject())
                .js.pipe(gulp.dest("_tmpdist"));
        });

        gulp.start('compile',function() {

            findModels().then((next) => {
                resolve(next);
            });

        });


    });

}

findModels = function () {

    return new Promise(function (resolve, reject) {
        var status = new Spinner('Compiling ts sources, please wait...');
        status.start();

        var buildFiles = function (src, callback) {
            glob('./_tmpdist/pages/home/*.js', callback);
        };

        buildFiles(files.getCurrentDirectory(), function (err, res) {
            "use strict";
            let build = {};

            res.forEach((file) => {

                // build[files.getBaseName(file).replace(".", "")] = fs.readFileSync(file).toString();
                var string = fs.readFileSync(file).toString();
                var result = string.split(/exports\.+[\w]+? = [\w]+?;/g); // String.prototype.split calls re[@@split].

                result.forEach((line) => {

                    var regex = /var ([\w])+? = \/\*\* @class \*\/ [^]+?PersistableModel\)\);/g;
                    var match = regex.exec(line);
                    if (match) {
                        var regex2 = /^var (\w+?) = \/\*\* @class \*\//gm;
                        var match2 = regex2.exec(match[0]);
                        if (match2 && match2.length == 2) {
                            var classname = match2[1];
                           build[classname] = base64.encode(match[0].replace("var "+classname+ " =","global."+classname+ " ="));
                        }
                    }


                });


            });

            var db = admin.database();
            let counter = 0;
            let queue = new Observable(function (observer) {

                Object.keys(build).forEach((model) => {
                    var ref = db.ref('_config/'+model+'/constructor');
                    ref.set(build[model]).then(() => {
                        counter++;
                        console.log(counter);
                        if (counter >=  Object.keys(build).length) {
                            observer.complete();
                        } else {
                            observer.next();
                        }

                    });
                });

            });

            queue.subscribe((next) => {}, (err) => {}, (complete) => {

                fs.unlink("./_tmpdist",function() {
                    status.stop();
                    resolve(chalk.green('Model constructors sucessfully uploaded.'));
                });


            });


        });

    });

}



module.exports = build;