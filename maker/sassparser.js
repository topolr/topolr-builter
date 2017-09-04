var topolr = require("topolr-util");
module.exports = function (content, option, fn) {
    var bile = this;
    var sass = require('node-sass');
    sass.render(topolr.extend(true, {
        file: bile.getPath(),
        sourceMap: true
    }, option), function (err, result) {
        if (!err) {
            fn(result.css.toString());
        } else {
            bile.setMakeErrorMessage(err.stack);
            fn(content);
        }
    });
};