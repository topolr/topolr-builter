var autoprefixer = require('autoprefixer');
var postcss      = require('postcss');
module.exports=function (content,option,fn) {
    var bile=this;
    var a=postcss([autoprefixer({ browsers: ['> 1%', 'IE 7']})]).process(content).then(function (result) {
        result.warnings().forEach(function (warn) {
            bile.setMakeWarnMessage(warn.toString());
        });
        fn(result.css);
    },function(e){
    	bile.setMakeErrorMessage(e.stack);
    	fn(content);
    });
};