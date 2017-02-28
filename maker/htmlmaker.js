module.exports=function (content,option,fn) {
    var bile=this;
    var minify = require('html-minifier').minify;
    try {
        fn(minify(content, {
            removeComments: true,
            collapseWhitespace: true,
            minifyJS: true,
            minifyCSS: true
        }));
    } catch (e) {
        bile.setMakeErrorMessage(e.stack);
        fn(content.replace(/>[\s]+</g, "><").replace(/\r\n/g, "").replace(/\r/g, "").replace(/\n/g, ""));
    }
};