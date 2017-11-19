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
                           build[classname] = wrapModelContructorFunction(match[0]);
                        }
                    }


                });


            });

            var db = admin.database();
            var ref = db.ref('_model');
            ref.set(build).then(() => {
                fs.unlink("./_tmpdist",function() {
                    status.stop();
                    resolve(chalk.green('Model constructors sucessfully uploaded.'));
                });
            });


        });

    });

}

wrapModelContructorFunction = function (string) {

    var output = `var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
  `

    output = output + '\n' + string;


    return output;


}

module.exports = build;