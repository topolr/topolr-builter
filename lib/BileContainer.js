var textbile=require("./biles/TextBile");
var packetbile=require("./biles/PacketBile");
var binarybile=require("./biles/BinaryBile");
var util=require("./util");
var topolr=require("topolr-util");
var isbinaryfile=require("isbinaryfile");
var ignore= require('ignore');

var bilecontainer=function(option,builder){
	var ths = this;
	this._option=topolr.extend(true,{},option);
	this._path=this._option.basePath;
    this._registry={};
    this._sourceMap={};
    this._builder=builder;
    this._ignored=[];
    this._ignore=ignore().add(this._option.ignore);

    var a=bilecontainer.getSourceFromNode.call(this);

    this._importdependencies=a;
    for(var i in a){
        var b=a[i].path[a[i].path.length-1]==="/"?a[i].path:a[i].path+"/";
        topolr.file(b).scan(function (_path,isfile) {
            if(isfile){
                bilecontainer.add.call(ths,_path,a[i]);
            }
        });
    }
    if(topolr.file(this._option.basePath).isExists()){
        topolr.file(this._option.basePath).scan(function (_path, isfile) {
            if (isfile) {
                bilecontainer.add.call(ths,_path);
            }
        });
    }else{
        util.logger.log("info","Path of "+this._option.basePath+" is not exist");
        process.exit();
    }
    this._warns={};
    this._errors={};
    bilecontainer.set.call(this);
};
bilecontainer.set=function () {
    this._warns={};
    this._errors={};
    var sourceMap={js: [],css: [],template: [],packet: [],text: [],image: [],json: [],html: []};
    var _map=[];
    for(var i in this._registry){
        var _a=this._registry[i];
        for(var t in _a){
            var _b=_a[t];
            if(_b instanceof packetbile) {
                var map = _b.getSourceTypeMapping();
                for (var q in map) {
                    sourceMap[q] = util.array.disconcat(sourceMap[q], map[q]);
                }
                var _map=_b.getMap();
                for(var i in _map){
                    var _ro=[];
                    for(var _q=0;_q<_map[i].length;_q++){
                        var _ee=_map[i][_q];
                        if(_ee[_ee.length-1]==="*"){
                            _ro=util.array.disconcat(_ro,bilecontainer.maped.call(this,_ee));
                        }else{
                            _ro.push(_ee);
                        }
                    }
                    sourceMap[i] = util.array.disconcat(sourceMap[i], _ro);
                }
            }else if(_b instanceof textbile){
                _b.setInnerMap();
            }
        }
    }
    for(var i in sourceMap.js){
        var q=sourceMap.js[i];
        var p=sourceMap.packet.indexOf(q);
        if(p!==-1){
            sourceMap.packet.splice(p,1);
        }
    }
    for (var i in sourceMap) {
        var type = i, st = sourceMap[i];
        for (var m = 0; m < st.length; m++) {
            var ep=st[m].split(/\[|\]/);
            var packet = ep[0],su=ep[1];
            var _c = this._registry[packet];
            if (_c) {
                if(!_c.__done||_c.__done===type) {
                    for (var e in _c) {
                        if (type !== "packet") {
                            var _ee = _c[e];
                            _ee._packetName = su ? (packet + "[" + _ee.getSuffix() + "]") : st[m];
                            _ee._sourceType = type;
                        }
                    }
                    Object.defineProperty(_c, "__done", {
                        enumerable: false,
                        configurable: false,
                        writable: false,
                        value: type
                    });
                }else{
                    this.addError("nopackete",{
                        type:type,
                        packet:packet,
                        msg:"different source(with different souceType,"+_c.__done+"and "+type+") has the same source name,name is "+packet+",sometimes source not in the required structure"
                    });
                }
            } else {
                this.addError("nopackete",{
                    msg:"packet not found",
                    type:type,
                    packet:packet
                });
            }
        }
    }
    for(var i in this._registry){
        var _a=this._registry[i];
        for(var t in _a){
            var _b=_a[t];
            if (!_b.getSourceType()) {
                _b._sourceType = "out";
                _b._isout = true;
            }
        }
    }
    this._sourceMap=sourceMap;
};
bilecontainer.create=function (path,importInfo) {
    var bile=null;
    var _path=util.path.getNormalizePath(path);
    if(!isbinaryfile.sync(_path)){
        var content=topolr.file(_path).readSync();
        var ispacket=util.packet.isPacket(content);
        if(ispacket){
            bile=new packetbile(this,_path,content,importInfo);
        }else{
            bile=new textbile(this,_path,content,importInfo);
        }
    }else{
        bile=new binarybile(this,_path,importInfo);
    }
    return bile;
};
bilecontainer.add=function (path,importInfo) {
    if(!bilecontainer.isIgnore.call(this,path)){
        try{
            var bile=bilecontainer.create.call(this,path,importInfo);
            var sn=bile.getPacketShortName(),suffix=bile.getSuffix();
            if(!this._registry[sn]){
                this._registry[sn]={};
            }
            this._registry[sn][suffix]=bile;
        }catch(e){
            console.error(e);
        }
    }
};
bilecontainer.remove=function (path) {
    if(!bilecontainer.isIgnore.call(this,path)){
        for(var i in this._registry){
            for(var t in this._registry[i]){
                var a=this._registry[i][t];
                if(a.getPath().indexOf(path)!==-1){
                    delete this._registry[i][t];
                }
            }
            var has=false;
            for(var t in this._registry[i]){
                has=true;
            }
            if(!has){
                delete this._registry[i];
            }
        }
    }
};
bilecontainer.edit=function (path) {
    if(!bilecontainer.isIgnore.call(this,path)){
        var bile=bilecontainer.create.call(this,path);
        var a=bile.getPacketShortName(),b=bile.getSuffix();
        if(this._registry[a]){
            this._registry[a][b]=bile;
        }
        for(var i in this._registry){
            for(var t in this._registry[i]){
                var a=this._registry[i][t];
                if(a instanceof textbile){
                    var ps=util.path.findPaths(a.getContent());
                    for(var m=0;m<ps.length;m++){
                        if(bile.getPath().lastIndexOf(ps[m])!==-1){
                            a._ismake=false;
                            a._isoutput=false;
                        }
                    }
                }
            }
        }
    }
};
bilecontainer.maped=function (packet) {
    var _q=packet.split(".");
    var _qq=_q.pop();
    var _w=_q.join(".");
    var r=[];
    for(var i in this._registry){
        var e=i.split(".");
        e.pop();
        var f=e.join(".");
        if(f===_w) {
            var _a = this._registry[i];
            for (var t in _a) {
                var _b = _a[t];
                r.push(_b.getPacketName());
            }
        }
    }
    return r;
};
bilecontainer.isIgnore=function(path){
    var a=topolr.cpath.getNormalizePath(path).substring(this._path.length);
    var b=this._ignore.filter([a]);
    if(b.length>0){
        return false;
    }else{
        if(this._ignored.indexOf(a)===-1){
            this._ignored.push(a);
        }
        return true;
    }
};

bilecontainer.getNodeDependencies=function (result,nodeModuleId) {
    var basePath=this._option.rootPath,ths=this;
    var packagePath=basePath+"/node_modules/"+nodeModuleId+"/package.json";
    if(topolr.file(packagePath).isExists()){
        var a=require(packagePath);
        if(a.topolr) {
            result[nodeModuleId]={
                config:a.topolr,
                id:nodeModuleId,
                path:require("path").resolve((basePath+"/node_modules/"+nodeModuleId+"/"),a.topolr.basePath).replace(/\\/g,"/")
            };
            var b=a.dependencies;
            for (var i in b) {
                bilecontainer.getNodeDependencies.call(ths,result,i);
            }
        }
    }
};
bilecontainer.getSourceFromNode=function () {
    var result={},ths=this;
    var path=this._option.rootPath+"/package.json";
    if(topolr.file(path).isExists()) {
        var a=require(path);
        for(var i in a.dependencies){
            bilecontainer.getNodeDependencies.call(ths, result,i);
        }
    }
    return result;
};

bilecontainer.prototype.getImportInfo=function () {
    return this._importdependencies;
};
bilecontainer.prototype.addWarn=function(type,info){
    if(!this._warns[type]){
        this._warns[type]=[];
    }
    this._warns[type].push(info);
    return this;
};
bilecontainer.prototype.addError=function(type,info){
    if(!this._errors[type]){
        this._errors[type]=[];
    }
    this._errors[type].push(info);
    return this;
};
bilecontainer.prototype.renderWarn=function(){
    util.logger.log("ignore",this._ignored);
    util.logger.log("containerwarn",this._warns);
    util.logger.log("containererror",this._errors);
}
bilecontainer.prototype.getBuilder=function () {
    return this._builder;
};
bilecontainer.prototype.isDebug=function () {
    return this._option.debug;
};
bilecontainer.prototype.getBasePath=function(){
	return this._path;
};
bilecontainer.prototype.getOutputPath=function () {
    return this._option.output;
};
bilecontainer.prototype.getOption=function(){
	return this._option;
};
bilecontainer.prototype.getBile = function (packetName,type) {
    if(!type){
        type="packet";
    }
	var a=packetName.split(/\[|\]/);
	var _a=a[0],_b=a[1];
	if(_b){
        if(this._registry[_a]){
    	    return this._registry[_a][_b];
        }else{
            return null;
        }
	}else{
		var _c=this._registry[_a];
		for(var i in _c){
            if (_c[i].getSourceType() === type) {
                return _c[i];
            }
		}
		return null;
	}
};
bilecontainer.prototype.getBootPackets = function () {
    var r=[];
    for(var i in this._registry){
    	var a=this._registry[i];
    	for(var t in a){
    		var b=a[t];
    		if(b instanceof packetbile && b.isBootPacket()){
    			r.push(b.getPacketName());
    		}
    	}
    }
    return r;
};
bilecontainer.prototype.getDependsOfPacket = function (packetName) {
    var _current=this.getBile(packetName),result={};
    result[_current.getSourceTypeAlias()]=[packetName];
    var getDepends=function(bilet){
        if (bilet && bilet instanceof packetbile) {
            for (var i = 0; i < bilet._require.length; i++) {
                var c=bilet._require[i],eq=bilet.getBilesContainer().getBile(c);
                var _c=eq.getSourceTypeAlias();
                if(!result[_c]||result[_c].indexOf(c)===-1){
                    if(!result[_c]){
                        result[_c]=[];
                    }
                    result[_c].push(c);
                }
                getDepends(eq);
            }
            for (var i = 0; i < bilet._depends.length; i++) {
                var c=bilet._depends[i],eq=bilet.getBilesContainer().getBile(c.value,c.type);
                if(eq) {
                    var _c = eq.getSourceTypeAlias();
                    if (!result[_c] || result[_c].indexOf(c.value) === -1) {
                        if (!result[_c]) {
                            result[_c] = [];
                        }
                        result[_c].push(c.value);
                    }
                    getDepends(eq);
                }else{
                    throw Error("source can not find name is "+c.value);
                }
            }
        }
    }
    getDepends(_current);
    return result;
};
bilecontainer.prototype.getAllDependsOfPacket=function (packetName) {
    // var result=[packetName];
    // var getAllDepends=function(bilet){
	 //    if (bilet && bilet instanceof packetbile) {
	 //        for (var i = 0; i < bilet._require.length; i++) {
	 //            var c = bilet._require[i];
	 //            result.indexOf(c) === -1 && result.push(c);
	 //            getAllDepends(bilet.getBilesContainer().getBile(c));
	 //        }
	 //        for (var i = 0; i < bilet._include.length; i++) {
	 //            var c = bilet._include[i];
	 //            result.indexOf(c) === -1 && result.push(c);
	 //            getAllDepends(bilet.getBilesContainer().getBile(c));
	 //        }
	 //        for (var i = 0; i < bilet._depends.length; i++) {
	 //            var c = bilet._depends[i];
	 //            result.indexOf(c.value) === -1 && result.push(c.value);
	 //            getAllDepends(bilet.getBilesContainer().getBile(c.value,c.type));
	 //        }
	 //    }
    // }
    // getAllDepends(this.getBile(packetName));
    // return result;
    var result=[packetName];
    var getAllDepends=function(bilet){
        if (bilet && bilet instanceof packetbile) {
            for (var i = 0; i < bilet._require.length; i++) {
                var c = bilet._require[i];
                result.indexOf(c) === -1 && result.push(c);
                getAllDepends(bilet.getBilesContainer().getBile(c));
            }
            for (var i = 0; i < bilet._include.length; i++) {
                var c = bilet._include[i];
                result.indexOf(c) === -1 && result.push(c);
                getAllDepends(bilet.getBilesContainer().getBile(c));
            }
            for (var i = 0; i < bilet._depends.length; i++) {
                var c = bilet._depends[i];
                result.indexOf(c.value) === -1 && result.push(c.value);
                getAllDepends(bilet.getBilesContainer().getBile(c.value,c.type));
            }
        }
    }
    getAllDepends(this.getBile(packetName));
    return result;
};
bilecontainer.prototype.getCompressMappingOfPacket=function (packetName) {
    var rn={};
    var compress=this.getDependsOfPacket(packetName);
    rn[packetName]=compress;
    var bile=this.getBile(packetName);
    if(bile){
        for(var i=0;i<bile._include.length;i++){
            var dp=this.getDependsOfPacket(bile._include[i]);
            var r={};
            for(var s in dp){
                var _c=dp[s];
                if(!compress[s]){
                    r[s]=_c;
                }else{
                    var _d=compress[s],n=[];
                    for(var m=0;m<_c.length;m++){
                        if(_d.indexOf(_c[m])===-1){
                            n.push(_c[m]);
                        }
                    }
                    if(n.length>0){
                        r[s]=n;
                    }
                }
            }
            rn[bile._include[i]]=r;
        }
    }else{
        throw Error("can not find packet name of "+packetName);
    }
    return rn;
};
bilecontainer.prototype.getAppCompressMapping = function () {
    var result = [];
    var option = this.getOption(), ths = this;
    var tt = this.getBile(option.bootPacket);
    var boots = this.getBootPackets();
    var m = boots.indexOf(option.bootPacket);
    if (m !== -1) {
        boots.splice(m, 1);
    }
    var boot = this.getCompressMappingOfPacket(option.bootPacket);
    for (var i in boot) {
        if (!topolr.is.isEmptyObject(boot[i])) {
            result.push(boot[i]);
        }
    }
    for (var i = 0; i < boots.length; i++) {
        var other = this.getCompressMappingOfPacket(boots[i]);
        for (var a in other) {
            var has = false;
            if (!boot[a]) {
                for (var f in boot) {
                    for(var q in boot[f]) {
                        if (boot[f][q].indexOf(a) !== -1) {
                            has = true;
                            break;
                        }
                    }
                }
            } else {
                has = true;
            }
            if (!has) {
                if(!topolr.is.isEmptyObject(other[a])){
                    var result0=result[0];
                    var m={};
                    for(var type in other[a]){
                        var k=other[a][type];
                        for(var kk=0;kk<k.length;kk++){
                            if(result0[type]&&result0[type].indexOf(k[kk])===-1){
                                if(!m[type]){
                                    m[type]=[];
                                }
                                m[type].push(k[kk]);
                            }
                        }
                    }
                    if(!topolr.is.isEmptyObject(m)){
                        var times=0;
                        for(var cd in m){
                            times+=m[cd].length;
                        }
                        if(times>1) {
                            result.push(m);
                        }
                    }
                }
            }
        }
    }
    var has = false;
    for (var i = 0; i < result.length; i++) {
        if (result[i][this.getSourceTypeAlias("packet")].indexOf(option.bootPacket) !== -1) {
            has = true;
            break;
        }
    }
    if (!has&&result.length>0) {
        util.logger.log("warn","boot packet maybe wrong.many boot compress file will make(repeact compress can be),and no one can be sure to loaded first");
    }
    return result;
};
bilecontainer.prototype.getSourceList = function () {
    var r=[];
    for(var i in this._registry){
        var a=this._registry[i];
        for(var t in a){
            r.push(a[t]);
        }
    }
    return r;
};
bilecontainer.prototype.each=function (fn) {
    var r=[];
    for(var i in this._registry){
        var a=this._registry[i];
        for(var t in a){
            fn&&fn(a[t]);
        }
    }
    return r;
};
bilecontainer.prototype.changeFiles=function(info){
    var has=false;
    for(var i in info){
        if(["add","remove","edit"].indexOf(i)!==-1){
            var a=info[i];
            if(a.length>0){
                has=true
                for(var t=0;t<a.length;t++){
                    var tp=a[t].replace(/\\/g,"/");
                    bilecontainer[i].call(this,tp);
                }
            }
        }
    }
    if(has){
        bilecontainer.set.call(this);
    }
};
bilecontainer.prototype.addFile = function (path) {
    var a = topolr.file(path),ths=this;
    if (a.isFile()) {
        bilecontainer.add.call(this,path);
    } else {
        a.scan(function (_path, isfile) {
            if (isfile) {
                bilecontainer.add.call(ths,_path);
            }
        });
    }
    bilecontainer.set.call(this);
};
bilecontainer.prototype.removeFile = function (path) {
    bilecontainer.remove.call(this,path);
    bilecontainer.set.call(this);
};
bilecontainer.prototype.editFile = function (path) {
    var a = topolr.file(path);
    if (a.isFile()) {
        bilecontainer.edit.call(this,path);
    } else {
        a.scan(function (_path, isfile) {
            if (isfile) {
                bilecontainer.edit.call(ths,_path);
            }
        });
    }
    bilecontainer.set.call(this);
};
bilecontainer.prototype.refresh = function () {
    this._registry={};
    this._sourceMap={};
    topolr.file(this._option.basePath).scan(function (_path, isfile) {
        if (isfile) {
            bilecontainer.add.call(ths,_path);
        }
    });
    bilecontainer.set.call(this);
};
bilecontainer.prototype.getSourceTypeSuffix=function (sourceType) {
    return this._option.sourceType[sourceType];
};
bilecontainer.prototype.getSourceTypeAlias=function (sourceType) {
    return this._option.sourceTypeAlias[sourceType];
};
bilecontainer.prototype.getSourceTypeByAlias=function (alias) {
    for(var i in this._option.sourceTypeAlias){
        if(this._option.sourceTypeAlias[i]===alias){
            return i;
        }
    }
};
bilecontainer.prototype.getOutMapSource=function () {
    var r=[];
    for(var i in this._registry){
        var a=this._registry[i];
        for(var t in a){
            if(a[t]._isout) {
                r.push(a[t]);
            }
        }
    }
    return r;
};
bilecontainer.prototype.getSourceFromMapping=function () {
    var r={};
    for(var i in this._registry){
        var a=this._registry[i];
        for(var t in a){
            r[a[t].getPacketName()]=a[t].isImport()?a[t].getImportInfo().id:"local";
        }
    }
    return r;
};
bilecontainer.prototype.getSourceMapping=function(){
    var r={};
    for(var i in this._registry){
        var a=this._registry[i],b=[];
        for(var t in a){
            b.push(a[t].getSimpleInfo());
        }
        r[i]=b;
    }
    return r;
}
bilecontainer.prototype.getBasicInfo=function () {
    var r=0;
    for(var i in this._registry) {
        var _a = this._registry[i];
        for (var t in _a) {
            r++;
        }
    }
    var sourceMap={js: [],css: [],template: [],packet: [],text: [],image: [],json: [],html: []};
    return {
        total:r,
        js:this._sourceMap.js?this._sourceMap.js.length:0,
        css:this._sourceMap.css?this._sourceMap.css.length:0,
        template:this._sourceMap.template?this._sourceMap.template.length:0,
        packet:this._sourceMap.packet?this._sourceMap.packet.length:0,
        text:this._sourceMap.text?this._sourceMap.text.length:0,
        image:this._sourceMap.image?this._sourceMap.image.length:0,
        json:this._sourceMap.json?this._sourceMap.json.length:0,
        html:this._sourceMap.html?this._sourceMap.html.length:0
    };
};

module.exports=function(option){
    return new bilecontainer(option);
};