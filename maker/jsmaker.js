var uglify = require("uglify-js");
var topolr=require("topolr-util");
var util=require("./../lib/util");
module.exports=function (content,option,fn) {
    var bile=this;
    var _content=content;
    if(!this.getBilesContainer().isDebug()) {
        try {
            var result = uglify.minify(content, {
                fromString: true,
                mangle: true
            });
            _content = result.code;
        } catch (e) {
            bile.setMakeErrorMessage(e.stack);
        }
    }else{
        _content=util.packet.cleanHeadCommet(_content);
    }
    fn(_content);
};