module.exports=function (content,option,fn) {
    var ths=this,bile=this;
    try{
        content=content.replace(/>[\s]+</g, "><").replace(/\r\n/g, "").replace(/\r/g, "").replace(/\n/g, "");
        if(!this.getBilesContainer().isDebug()){
            content=this.util.path.replacePaths(content,function (path) {
                var pn=ths.util.path.getPacketName(path);
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
        }
    }catch(e){
        bile.setMakeErrorMessage(e.stack);
    }
    fn(content);
};