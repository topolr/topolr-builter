var base=require("./BaseBile");
var topolr=require("topolr-util");
var util=require("./../util");

var textbile=function(container,path,content,isimport){
	base.call(this,container,path,isimport);
	this._content=content;
	this._suboutput=[];
	this._hash=topolr.hash.md5(content).substring(0,10);
};
textbile.prototype=new base();
textbile.prototype.getContent=function(){
	return this._content;
};
textbile.prototype.setInnerMap=function () {
    var a=util.path.findPathsMap(this._content);
    var d=[];
    for(var i in a){
        var type=i;
        for(var t=0;t<a[i].length;t++) {
            var path = a[i][t];
            if(type==="url"||type==="import") {
                var at = util.path.getRelativePath(this.getPath(), path);
                var pn = util.path.getPacketName(this.getBasePath(), at);
                var bb = this.getBilesContainer().getBile(pn);
                if (bb) {
                    bb._sourceType = "inner";
                    d.push(path);
                }
            }
            if(type==="url"||type==="src"){
                var pn=util.path.getPacketName(path);
                var bb=this.getBilesContainer().getBile(pn);
                if (bb) {
                    bb._sourceType = "inner";
                    d.push(path);
                }
            }
        }
    }
    return d;
};
textbile.prototype.getResult=function(){
	return this._result||this._content;
};
textbile.prototype.output=function () {
	var ps=topolr.file(this.getOutputPath()).write(this.getResult());
    for(var i in this._suboutput){
        (function (info) {
            ps.then(function () {
                return topolr.file(info.path).write(info.content);
            });
        })({
            path:i,
            content:this._suboutput[i]
        });
    }
    return ps;
};
textbile.prototype.appendSubOutput=function (path,content) {
    this._suboutput[path]=content;
    return this;
};
textbile.prototype.getResultHash=function () {
	return topolr.hash.md5(this.getResult()).substring(0,10);
};
textbile.prototype.getResultSize=function(){
	return util.getSize(util.getStrByteSize(this.getResult()));
};
textbile.prototype.getBileType=function(){
    return "text";
};

module.exports=textbile;