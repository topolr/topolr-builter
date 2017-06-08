var main=require("./../../main");
var util = require("./../../lib/util");
module.exports={
    command: "override",
    paras: ["name"],
    desc: "copy npm topolr module to source,then you can override them",
    fn:function(parameters, cellmapping, allmapping){
        if(parameters[0]) {
            main.override(parameters[0], allmapping);
        }else{
            util.logger.log("info","module name can not empty");
        }
    }
};