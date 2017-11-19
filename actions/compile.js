var CLI = require('clui');
var Spinner = CLI.Spinner;

var gulp = require('gulp');
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json", {target: 'node', module: "commonjs", noExternalResolve: true});


build= function() {

    return new Promise(function (resolve, reject) {

        var status = new Spinner('Compiling ts sources, please wait...');
        status.start();

        gulp.task("compile", function () {
            return tsProject.src()
                .pipe(tsProject())
                .js.pipe(gulp.dest("dist"));
        });

        gulp.start('compile',function() {
            resolve('done');
        });


    });

}

module.exports = build;