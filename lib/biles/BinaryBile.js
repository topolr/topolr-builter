var base=require("./BaseBile");
var topolr=require("topolr-util");
var util=require("./../util");

var binarybile=function(container,path,importInfo){
	base.call(this,container,path,importInfo);
	this._hash=topolr.file(this._path).hash().substring(0,10);
};
binarybile.prototype=new base();
binarybile.prototype.getContent=function(){
	return this._url;
};
binarybile.prototype.getResult=function(){
	return this._url;
};
binarybile.prototype.copyTo=function(path){
	topolr.file(this._path).copyTo(path);
};
binarybile.prototype.getFileStream=function () {
	return fs.createReadStream(this._path);
};
binarybile.prototype.output=function () {
	return topolr.file(this._path).copyTo(this.getOutputPath());
};
binarybile.prototype.getResultHash=function () {
	return this._hash;
};
binarybile.prototype.getResultSize=function(){
	return util.getSize(topolr.file(this._path).infoSync().size);
}
binarybile.prototype.getBileType=function(){
	return "binary";
};

module.exports=binarybile;