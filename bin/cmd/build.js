var topolr=require("topolr-util");
var main=require("./../../main");
var util=require("./../../lib/util");
module.exports= {
    command: "build",
    desc: "build the project in different ways\n" +
            topolr.logText("(color:white=>--pub)")+" : build project in publish mode\n"+
            topolr.logText("(color:white=>--pub-all)")+" : build project in publish mode\n"+
            topolr.logText("(color:white=>--dev)")+" : build project in publish mode\n"+
            topolr.logText("(color:white=>--dev-all)")+" : build project in develop mode",
    paras: ["type"],
    fn: function (parameters, cellmapping, allmapping) {
        var type=parameters[0];
        if(type){
            if(type==="--dev"){
                main.build_dev(allmapping);
            }else if(type==="--pub"){
                main.publish(allmapping);
            }else if(type==="--dev-all"){
                main.build_dev_all(allmapping);
            }else if(type==="--pub-all"){
                main.build_pub_all(allmapping);
            }else{
                util.logger.log("info","Type[ "+type+" ] can not find");
            }
        }else{
            util.logger.log("info","Type can not empty");
        }
    }
};