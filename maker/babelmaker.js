var babel = require("babel-core");
var topolr=require("topolr-util");
module.exports=function (content,option,fn) {
    var bile=this;
    try{
        var _path=topolr.cpath.getRelativePath(__dirname+"/","./../node_modules/");
        var result=babel.transform(content,{
            presets: [
                _path+"babel-preset-es2015",
                _path+"babel-preset-stage-2"]
        });
        fn(result.code.substring(13));
    }catch(e){
        bile.setMakeErrorMessage(e.stack);
        fn(content);
    }
};