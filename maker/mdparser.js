var topolr = require("topolr-util");
module.exports = function (content, option, fn) {
    var bile = this;
    var marked = require('marked');
    marked.setOptions(topolr.extend(true, {
        renderer: new marked.Renderer(),
        gfm: true,
        tables: true,
        breaks: false,
        pedantic: false,
        sanitize: false,
        smartLists: true,
        smartypants: false
    }, option));
    marked(content, function (err, r) {
        if (err) {
            bile.setMakeErrorMessage(err.stack);
            fn(content);
        } else {
            fn(r);
        }
    });
}