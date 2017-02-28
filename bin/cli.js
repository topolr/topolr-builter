#!/usr/bin/env node  
var topolr=require("topolr-util");
var commander=topolr.commander();
var util=require("./../lib/util");
commander.onbefore(function (a) {
    if(["build","develop"].indexOf(a)!==-1) {
        var t = topolr.file(process.cwd() + "/topolr-builter-config.js");
        var config = {};
        if (t.isExists()) {
            config = require(process.cwd() + "/topolr-builter-config.js");
            config.basePath=topolr.cpath.getRelativePath(process.cwd()+"/",config.basePath);
            this.setScope(config);
            return true;
        } else {
            util.logger.log("info","File topolr-builter-config.js can not find,You should create topolr-builter-config.js first");
            return false;
        }
    }else{
        return true;
    }
});
[
    require("./cmd/version"),
    require("./cmd/build"),
    require("./cmd/develop"),
    require("./cmd/init")
].forEach(function (a) {
    var command=a.command, desc=a.desc, paras=a.paras, fn=a.fn;
    commander.bind(command,desc,paras,fn);
});
commander.call(process.argv.slice(2));