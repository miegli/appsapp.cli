var CLI = require('clui');
var Spinner = CLI.Spinner;
var chalk = require('chalk');
var admin = require("firebase-admin");

reset = function (program) {

    return new Promise(function (resolve, reject) {

        var status = new Spinner('Cleaning old configuration for '+program.reset+', please wait...');
        status.start();

        var db = admin.database();

        var ref = db.ref('_config/' + program.reset);

        var resettedData = {};
        ref.once("value", function(snap) {

            if (snap.val() && snap.val().constructor) {
                resettedData.constructor = snap.val().constructor;

                ref.set(resettedData).then(() => {
                    status.stop();
                    resolve(chalk.green('Successfully done. '+program.reset+' is now ready for new entries.'));

                });

            } else {
                status.stop();
                resolve(chalk.green('Done.'));
            }






        });







    });

}


module.exports = reset;