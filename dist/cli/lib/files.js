var fs = require('fs');
var path = require('path');

module.exports = {
    getCurrentDirectoryBase : function() {
        return path.basename(process.cwd());
    },

    getBaseName: function(file) {
        return path.basename(file);
    },

    getCurrentDirectory : function() {
        return (process.env.PWD);
        //return (process.cwd());
    },

    directoryExists : function(filePath) {
        try {
            return fs.statSync(filePath).isDirectory();
        } catch (err) {
            return false;
        }
    },

    fileExists : function(filePath) {
        try {
            return fs.statSync(filePath).isFile();
        } catch (err) {
            return false;
        }
    },

    getBuildFile: function() {

        if (fs.statSync(this.getCurrentDirectory()+'/.angular-cli.json').isFile()) {
            return this.getCurrentDirectory() + '/dist/main.bundle.js';
        } else {
            return this.getCurrentDirectory() + '/www/build/main.js';
        }




    }
};