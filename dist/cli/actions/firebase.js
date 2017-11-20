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


                let firebasejson = {
                        "functions": {
                            "source": workingDir + "/../functions"
                        }
                    }
                ;


                fs.writeFile(files.getCurrentDirectory()+'/firebase.json',JSON.stringify(firebasejson),function(err) {

                    if (!err) {
                        cmd.get(
                            'firebase use '+(program && program.project ? program.project : firebaserc.projects.default)+' && firebase deploy --only functions',
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