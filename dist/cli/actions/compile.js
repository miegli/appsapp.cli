var CLI = require('clui');
var Spinner = CLI.Spinner;
var fs = require('fs');
var fsextra = require('fs-extra');
var glob = require('glob');
var files = require('../lib/files');
var gulp = require('gulp');
var ts = require("gulp-typescript");

var replace = require('replace-in-file');
var chalk = require('chalk');
var admin = require("firebase-admin");
var Observable = require('rxjs/Observable').Observable;
const base64 = require('base-64');

build = function (program) {


    return new Promise(function (resolve, reject) {

        gulp.task("compile", function () {
            var tsProject = ts.createProject(files.getCurrentDirectory() + "/tsconfig.json", {
                target: 'es5',
                module: "commonjs",
                noResolve: false
            });

            return tsProject.src()
                .pipe(tsProject())
                .js.pipe(gulp.dest("./_tmpdist"));
        });

        gulp.start('compile', function () {


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
            glob('./_tmpdist/**/*.js', callback);
        };


        buildFiles(files.getCurrentDirectory(), function (err, res) {
            "use strict";
            let build = {};

            if (res) {
                res.forEach((file) => {


                    var string = fs.readFileSync(file).toString();
                    var result = string.split(/exports\.+[\w]+? = [\w]+?;/g); // String.prototype.split calls re[@@split].

                    result.forEach((line) => {


                        var regex = /var ([\w])+? = [^]+?PersistableModel\)\);/g;
                        var match = regex.exec(line);
                        var classname = null;

                        if (match) {

                            var regex2 = /^var (\w+?) =/gm;
                            var match2 = regex2.exec(match[0]);

                            if (match2 && match2.length == 2) {
                                var classname = match2[1];
                                if (classname == '__extends') {

                                    var regex2 = /^var (\w+?) = \//gm;
                                    var match2 = regex2.exec(match[0]);
                                    if (match2 && match2.length == 2) {
                                        var classname = match2[1];
                                    }

                                }
                            }

                            if (classname) {
                                build[classname] = injectRequire(match[0].replace("var " + classname + " =", "global." + classname + " ="), string).replace(/require\("appsapp-cli/g, 'require("appsapp-cli/appsapp-cli.umd').replace(/require\("appsapp-module/g, 'require("appsapp-module/appsapp-module.umd');
                            }

                        }


                    });


                });
            }


            // post process inject dependencies for list decorator
            Object.keys(build).forEach((classname) => {
                var injectedRequire = {};
                var regex = new RegExp(/IsList\((\w+?)\)/gm);
                var match = build[classname].match(regex);
                if (match) {
                    match.forEach((m) => {

                        var listRequire = m.split('(')[1].replace(/\)/gm, '').trim();
                        if (injectedRequire[listRequire] == undefined && build[listRequire] !== undefined) {
                            build[classname] = build[classname].replace(m, m.replace(listRequire, 'global.' + listRequire));
                            build[classname] = build[classname] + '\n' + build[listRequire].split('/**END_OF_APPSAPPS_INJECT_REQUIRE**/')[1];
                            injectedRequire[listRequire] = true;
                        }
                    });

                }
            });


            // post process base64 encode
            Object.keys(build).forEach((classname) => {
                build[classname] = base64.encode(build[classname]);
            });


            var db = admin.database();
            let counter = 0;
            let queue = new Observable(function (observer) {

                if (Object.keys(build).length == 0) {
                    observer.complete();
                }


                Object.keys(build).forEach((model) => {
                    var ref = db.ref('_config/' + model + '/constructor');
                    ref.set(build[model]).then(() => {
                        counter++;

                        if (counter >= Object.keys(build).length) {
                            observer.complete();
                        } else {
                            observer.next();
                        }

                    });
                });

            });

            queue.subscribe((next) => {
            }, (err) => {
            }, (complete) => {

                fsextra.remove("./_tmpdist", function (err) {
                    status.stop();
                    resolve(chalk.green('Backend functions successfully updated.'));
                });

            });


        });

    });

}

injectRequire = function (codeModel, codeFullFile) {
    "use strict";


    var injectRequire = 'var t=null';

    var regex = new RegExp(/ ([\w_0-9])*? = require\(["|']([^\)]*?)["|']\)/g);
    var match = codeFullFile.match(regex);


    match.forEach((line) => {

        var r = false;

        if (line.indexOf("'appsapp-cli'") > 0 || line.indexOf('"appsapp-cli"') > 0 || line.indexOf("'appsapp-module'") > 0 || line.indexOf('"appsapp-module"') > 0) {
            r = true;
            injectRequire += ',' + line;
        }

        if (!r) {
            var regex2 = new RegExp(/([^=])*? =/);
            var match2 = line.trim().match(regex2);
            injectRequire += ',' + match2[0] + ' function() {}';

        }


    });

    injectRequire += ";\n";

    return injectRequire + "\n /**END_OF_APPSAPPS_INJECT_REQUIRE**/ \n\n" + codeModel;

}


module.exports = build;