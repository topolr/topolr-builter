var base=require("./BaseBile");
var util=require("./../util");
var topolr=require("topolr-util");

var packetbile=function(container,path,content,importInfo){
	base.call(this,container,path,importInfo);
	this._require = [];
    this._include = [];
    this._depends = [];
	this._image=[];
    this._text=[];
    this._js=[];
    this._template=[];
    this._css=[];
    this._json=[];
    this._html=[];
    this._other=[];
    this._map=[];
    this._content=content;
    this._sourceType="packet";
    this._hash=topolr.hash.md5(content).substring(0,10);
    this._isbootpacket=false;
    this._note="";
    this._suboutput={};
    var n=util.packet.getPacketInfo(content);
    for(var i in n){
    	this[i]=n[i];
    }
    if(this._path.indexOf(this.getBilesContainer().getOption().bootFolder)===0){
    	this._isbootpacket=true;
    }
};
packetbile.prototype=new base();
packetbile.prototype.getImage=function () {
    return this._image;
};
packetbile.prototype.getText=function () {
    return this._text;
};
packetbile.prototype.getJs=function () {
    return this._js;
};
packetbile.prototype.getTemplate=function () {
    return this._template;
};
packetbile.prototype.getCss=function () {
    return this._css;
};
packetbile.prototype.getJson=function () {
    return this._json;
};
packetbile.prototype.getHtml=function () {
    return this._html;
};
packetbile.prototype.getMap=function () {
    var a=this._map;r={};
    for(var i=0;i<a.length;i++){
        var b=a[i];
        var c=b.split(/\(|\)/);
        if(c.length===3){
            if(!r[c[1]]){
                r[c[1]]=[];
            }
            r[c[1]].push(c[2]);
        }
    }
    return r;
};
packetbile.prototype.isBootPacket=function(){
	return this._isbootpacket;
};
packetbile.prototype.getContent=function(){
	return this._note + "\r\n" + this._content;
};
packetbile.prototype.getResult=function(){
	return this._note + "\n" + this._result || this._content;
};
packetbile.prototype.getSourceTypeMapping=function(){
	return {
		js:this._js,
		css:this._css,
		template:this._template,
		image:this._image,
		json:this._json,
		html:this._html,
        text:this._text,
		packet:util.array.disconcat(this._require,this._include,[this._packetName])
	}
};
packetbile.prototype.output=function () {
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
packetbile.prototype.appendSubOutput=function (path,content) {
    this._suboutput[path]=content;
    return this;
};
packetbile.prototype.getResultHash=function () {
    return topolr.hash.md5(this.getResult()).substring(0,10);
};
packetbile.prototype.getResultSize=function(){
    return util.getSize(util.getStrByteSize(this.getResult()));
};
packetbile.prototype.getBileType=function(){
    return "packet";
};

module.exports=packetbile;