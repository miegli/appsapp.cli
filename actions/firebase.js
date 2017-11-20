var CLI = require('clui');
var cmd=require('node-cmd');
var Spinner = CLI.Spinner;
var fs = require('fs');
var path = require('path');
var files = require('../lib/files');
var chalk = require('chalk');

firebase = function (program) {

    return new Promise(function (resolve, reject) {

        var workingDir = path.dirname(fs.realpathSync(__filename));





        var status = new Spinner('Deploying firebase functions, please wait...');
        status.start();

        fs.readFile(files.getCurrentDirectory()+'/.firebaserc', 'utf8', function(err, data) {
            if (err) {
                reject(err);
            }

            var firebaserc = JSON.parse(data);


            if (program.project || (firebaserc.projects && firebaserc.projects.default)) {


                fs.copy(workingDir + "/../functions",files.getCurrentDirectory()+"/functions",function(err) {

                    if (!err) {
                        cmd.get(
                            'cd functions && npm install && cd ../ && firebase use '+(program && program.project ? program.project : firebaserc.projects.default)+' && firebase deploy --only functions',
                            function(err, data, stderr){
                                status.stop();
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve(chalk.green('Deploy complete!'));
                                }


                            }
                        );
                    } else {
                        reject(err);
                    }


                });



            } else {
                reject('no default firebase project provided. please run firebase init first.');
            }



        });










    });

}


module.exports = firebase;