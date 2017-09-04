var autoprefixer = require('autoprefixer');
var postcss = require('postcss');
var topolr = require("topolr-util");
module.exports = function (content, option, fn) {
    var bile = this;
    var a = postcss(topolr.extend(true, [
        autoprefixer({browsers: ['> 1%', 'IE 7']})
    ], option)).process(content).then(function (result) {
        result.warnings().forEach(function (warn) {
            bile.setMakeWarnMessage(warn.toString());
        });
        fn(result.css);
    }, function (e) {
        bile.setMakeErrorMessage(e.stack);
        fn(content);
    });
};