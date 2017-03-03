var util=require("./../util");
var basebile=function(container,path,isimport){
	this._path = path;
    this._container = container;
    this._isout=false;
    this._hash="";
    this._result=null;
    this._ismake=false;
    this._isoutput=false;
    this._sourceType="";
    this._outmapsuffix="";
    this._warnmessage=[];
    this._errormessage=[];
    this._isimport=isimport||false;
    if(container) {
        this._suffix=util.path.getSuffix(path);
        this._type=this._suffix;
        this._packetName = util.path.getPacketName(this.getBasePath(), path);
        this._url = path.substring(this.getBasePath().length);
        this._packet=this._packetName;
        this._packetShortName=this._packetName.split(/\[|\]/)[0];
    }
};
basebile.prototype.getBasePath=function () {
    if(this._isimport){
        return this.getBilesContainer().getImportPath();
    }else{
        return this.getBilesContainer().getBasePath();
    }
};
basebile.prototype.getPacketName=function () {
    return this._packetName;
};
basebile.prototype.getBilesContainer=function(){
    return this._container;
};
basebile.prototype.getSourceType=function(){
	return this._sourceType;
};
basebile.prototype.getMakerType=function () {
    var t=["template"];
    var a=t.indexOf(this.getSourceType());
    if(a!==-1){
        return t[a];
    }else {
        return this._type;
    }
};
basebile.prototype.isMapOut=function(){
	return this._isout;
};
basebile.prototype.getPath=function(){
	return this._path;
};
basebile.prototype.getShortPath=function () {
    return this._path.substring(this.getBasePath().length);
};
basebile.prototype.getURL=function(){
	return this._url;
};
basebile.prototype.getSourceTypeMapping=function(){
	return {};
};
basebile.prototype.getOutputPath=function(){
	var path=util.path.getNormalizePath(this._path);
    var basepath=this.getBasePath();
    var outpath=util.path.getNormalizePath(this.getBilesContainer().getOutputPath());
    var outputsuffix=this.getOutputSuffix();
    if(outpath[outpath.length-1]!=="/"){
        outpath=outpath+"/";
    }
    var newpath = outpath + path.substring(basepath.length);
    var ed=newpath.split(".");
    ed.pop();
    if(this.getBilesContainer().getOption().debug){
        return ed.join(".")+"." + outputsuffix;
    }else {
        if(this._sourceType!=="out") {
            var nn = ed.join(".").split("/");
            nn.pop();
            newpath = nn.join("/") + "/" + this.getResultHash() + "." + outputsuffix;
            return newpath;
        }else{
            return ed.join(".")+"." + outputsuffix;
        }
    }
};
basebile.prototype.getHash=function(){
	return this._hash;
};
basebile.prototype.getContent=function(){};
basebile.prototype.getResult=function(){};
basebile.prototype.isMaked=function () {
    return this._ismake;
};
basebile.prototype.isOutput=function () {
    return this._isoutput;
};
basebile.prototype.isOutMapping=function () {
    return this._isout;
};
basebile.prototype.isImport=function () {
    return this._isimport;
};
basebile.prototype.isInnerMapping=function () {
    return this._sourceType==="inner";
};
basebile.prototype.output=function () {
};
basebile.prototype.getPacketShortName=function () {
    return this._packetShortName;
};
basebile.prototype.getSuffix=function () {
    return this._suffix;
};
basebile.prototype.getOutputSuffix=function () {
    var r="";
    if(this._sourceType==="out"){
        r=this._outmapsuffix||this._suffix;
    }else{
        var a=this._packetName.split(/\[|\]/);
        if(a[1]){
            r=a[1];
        }else {
            r=this.getBilesContainer().getSourceTypeSuffix(this._sourceType);
        }
    }
    return r;
};
basebile.prototype.getSourceTypeAlias=function () {
    return this.getBilesContainer().getSourceTypeAlias(this._sourceType);
};
basebile.prototype.getResultHash=function () {
    return this._hash;
};
basebile.prototype.setMakeWarnMessage=function(info){
    this._warnmessage.push(info);
};
basebile.prototype.setMakeErrorMessage=function(info){
    this._errormessage.push(info);
}
basebile.prototype.getMakeWarnMessage=function(){
    return this._warnmessage;
};
basebile.prototype.getMakeErrorMessage=function(){
    return this._errormessage;
};
basebile.prototype.getResultSize=function(){};
basebile.prototype.getBileType=function(){};
basebile.prototype.util=util;

basebile.prototype.getSimpleInfo=function(){
    return {
        type:this.getBileType(),
        packet:this.getPacketName(),
        path:this.getPath(),
        shortpath:this.getShortPath(),
        packetshortname:this.getPacketShortName(),
        sourcetype:this._sourceType,
        outputpath:this.getOutputPath(),
        resulthash:this.getResultHash,
        makeerrormessage:this.getMakeErrorMessage(),
        makewarnmessage:this.getMakeWarnMessage(),
        resultsize:this.getResultSize(),
        outputsuffix:this.getOutputSuffix(),
        suffix:this.getSuffix(),
        isoutmap:this.isOutMapping(),
        isoutput:this.isOutput(),
        ismake:this.isMaked(),
        ismapout:this.isMapOut(),
        makertype:this.getMakerType(),
        hash:this.getResultHash()
    }
};

module.exports=basebile;