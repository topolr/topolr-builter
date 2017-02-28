var util=require("./../../lib/util");
var map=require("./../../package.json");
module.exports={
	command: "version",
    desc: "builter version",
    paras: [],
    fn:function(){
    	util.logger.log("info",map.version);
    }
}