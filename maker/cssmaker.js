var uglifycss = require("uglifycss");
module.exports=function (content,option,fn) {
    var r=content,ths=this,bile=this;
    try{
        if(!this.getBilesContainer().isDebug()){
            r=this.util.path.replacePaths(r,function (path) {
                var a=ths.util.path.getRelativePath(bile.getPath(),path);
                var pn=ths.util.path.getPacketName(ths.getBilesContainer().getBasePath(),a);
                var bb=ths.getBilesContainer().getBile(pn);
                var a=path.split("/");
                var b=a.pop().split(".");
                if(bb){
                    return a.join("/")+"/"+bb.getHash()+"."+b[1];
                }else{
                    bile.setMakeWarnMessage("bile can not find of "+pn);
                    return path;
                }
            });
            r=uglifycss.processString(r, {
                uglyComments: true,
                cuteComments: true
            });
        }
    }catch(e){
        bile.setMakeErrorMessage(e.stack);
    }
    fn(r);
};