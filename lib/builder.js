var container=require("./BileContainer");
var config=require("./../config/congfig");
var topolr=require("topolr-util");
var Path=require("path");
var fs=require("fs");
var util=require("./util");
var binfo=require("./../package.json");

var builder=function(option){
	option.basePath=util.path.getNormalizePath(option.basePath);
    if(option.basePath[option.basePath.length-1]!=="/"){
        option.basePath=option.basePath+"/";
    }
    option.bootFolder = option.basePath + option.bootFolder;
    option.output = util.path.getRelativePath(option.basePath,option.output);
    if(topolr.is.isString(option.pageTemp)){
        option.pageTemp=[option.pageTemp];
    }
    for(var i=0;i<option.pageTemp.length;i++){
        option.pageTemp[i] = util.path.getRelativePath(option.basePath,option.pageTemp[i]);
    }

    // option.importPath=(process.cwd()+"/topolr_modules/").replace(/\\/g,"/");
    option.importPath="G:/caplr/topolr-doc/topolr_modules/";
    // option.rootPath=process.cwd()+"/";
    option.rootPath="G:/caplr/topolr-doc/";


    var at=config.ignore,ate=option.ignore;
    this._option=topolr.extend(true,{},config,option);
    this._option.ignore=at.concat(ate);
    this._sourcecontainer=new container(this._option,this);
    this._id=topolr.hash.md5(this._option.basePath);
};
builder.prototype.getBasePath=function () {
    return this._option.basePath;
};
builder.prototype.getMaker = function (makerName) {
    return this._option.maker[makerName];
};
builder.prototype.getMakerOption=function(makerName){
    return this._option.makerOption[makerName]||{};
},
builder.prototype.isDebug=function () {
    return this._option.debug;
};
builder.prototype.getSourceContainer=function () {
    return this._sourcecontainer;
};
builder.prototype.getSequnce = function (type) {
    return this._option.sequnce[type];
};
builder.prototype.getOutmapSequnce=function (suffix) {
    return this._option.outmapSequnce;
};
builder.prototype.isOutmap=function () {
    return this._option.outMap;
};
builder.prototype.getDevport=function () {
    return this._option.devport;
};
builder.prototype.getBasicInfo=function () {
    var info=this.getSourceContainer().getBasicInfo();
    return topolr.extend({
        version:binfo.version,
        basePath:this._option.basePath,
        imports:this.getSourceContainer().getImportInfo()
    },info);
};

builder.prototype.doMake=function (info) {
    var all=topolr.queue(),_ps=topolr.promise();
    var ths=this;
    var compress=this.getSourceContainer().getSourceList();
    var doarray=[],logarray=[];
    for(var i=0,len=compress.length;i<len;i++){
        var bile=compress[i];
        if (!bile.isMaked()) {
            var seq = null;
            if(bile.isOutMapping()){
                if(this.isOutmap()) {
                    var _ete = this.getOutmapSequnce(bile.getSuffix());
                    seq = _ete.step;
                    bile._outmapsuffix = _ete.to;
                }
            }else{
                seq=this.getSequnce(bile.getMakerType());
            }
            if (seq) {
                all.add(function (aa, bb) {
                    var q = topolr.queue();
                    q.bile = bb.bile;
                    bb.bile._warnmessage=[];
                    bb.bile._errormessage=[];
                    q.complete(function (a) {
                        this.bile._result = a;
                        this.bile._ismake = true;
                        util.logger.log("make",this.bile);
                        all.next();
                    });
                    for (var m = 0; m < bb.makers.length; m++) {
                        q.add(function (a, b) {
                            var sths = this;
                            b.maker.call(this.bile,a,b.option,function (content) {
                                sths.next(content);
                            });
                        }, function (e, f) {
                            console.error(f);
                            this.next();
                        }, {
                            maker:ths.getMaker(bb.makers[m]),
                            option:ths.getMakerOption(bb.makers[m])
                        });
                    }
                    q.run(q.bile.getContent());
                }, function (a, b, c) {
                    console.error(b);
                    this.next();
                }, {
                    bile: bile,
                    makers: seq
                });
                doarray.push(bile);
                logarray.push(bile.getPacketName());
            }
        }
    }
    all.complete(function () {
        util.logger.log("makedone");
        util.logger.log("makeinfo",doarray);
        info.make=logarray;
        info.domake=doarray;
        _ps.resolve(info);
    });
    util.logger.log("makestart");
    all.run();
    return _ps;
};
builder.prototype.doOutput=function (info) {
    var ths=this,ps=topolr.promise();
    var a=ths.getSourceContainer().getSourceList();
    var _queue=topolr.queue();
    var dooutput=[];
    for(var i=0;i<a.length;i++){
        var bl=a[i];
        if(!bl.isOutput()) {
            _queue.add(function (a, b) {
                b.output().then(function () {
                    util.logger.log("output",b);
                    dooutput.push({
                        packet:b.getPacketName(),
                        outpath:b.getOutputPath(),
                        done:true
                    });
                    b._isoutput = true;
                    _queue.next();
                });
            }, function (a, b, c) {
                console.error(b);
                this.next();
            }, bl);
        }
    }
    _queue.complete(function () {
        util.logger.log("outputdone");
        info.output=dooutput;
        ps.resolve(info);
    });
    util.logger.log("outputstart");
    _queue.run();
    return ps;
};
builder.prototype.doMerge=function (info) {
    var ths=this;
    var pmap={},_map={};
    var ps=topolr.promise();
    try{
        var _a=this.getSourceContainer().getSourceList();
        for(var i=0;i<_a.length;i++){
            if(!_a[i].isOutMapping()&&!_a[i].isInnerMapping()) {
                pmap[_a[i].getPacketName()] = _a[i].getResultHash();
                if(!_map[_a[i].getSourceTypeAlias()]){
                    _map[_a[i].getSourceTypeAlias()]={};
                }
                _map[_a[i].getSourceTypeAlias()][_a[i].getPacketName()]=_a[i].getResultHash();
            }
        }
        var a=this.getSourceContainer().getAppCompressMapping();
        var b=this.getcompresscontent.call(this,a);

        var compressmap={};
        for(var i=0;i<b.length;i++){
            var ct=b[i];
            compressmap[ct.name]=ct.list;
        }

        var mapping={
            d:this._option.debug,
            m:_map,
            c:compressmap
        };
        var queue=topolr.queue();
        var domerge=[];
        for(var i=0;i<b.length;i++){
            queue.add(function (a,b) {
                var th=this;
                topolr.file(ths._option.output+b.path).write(b.content).then(function () {
                    var _if={
                        path:(ths._option.output+b.path),
                        size:util.getStrByteSize(b.content),
                        result:true,
                        done:true,
                        name:b.path
                    };
                    util.logger.log("merge",_if);
                    domerge.push(_if);
                    queue.next();
                });
            },function (a,b,c) {
                console.error(b);
            },b[i]);
        }
        queue.complete(function () {
            util.logger.log("mergedone");
            info.mergeFiles=domerge;
            info.sourceMap=mapping;
            ps.resolve(info);
        });
        util.logger.log("mergestart");
        queue.run();
    }catch(e){
        util.logger.log("error",e);
        ps.resolve({
            mergeFiles:[],
            sourceMap:{}
        });
    }
    return ps
};
builder.prototype.doPage=function (info) {
    var ths=this;
    info.editPage=[];
    var ps=topolr.promise(function(a){
        a();
    });
    for(var m=0;m<ths._option.pageTemp.length;m++){
        (function(path){
            ps.then(function(){
                return topolr.file(path).read().then(function (content) {
                    return content.replace(/App\(\{[\w\W]*?\}\)/g,function (a) {
                        var q = a.substring(4, a.length - 1);
                        var obj=new Function("return "+q)();
                        obj.map=info.sourceMap;
                        if(ths.isDebug()){
                            info.sourceMap.id=ths.getId();
                            return "App("+JSON.stringify(obj,null,4)+")";
                        }else{
                            return "App("+JSON.stringify(obj)+")";
                        }
                    });
                },function (e) {
                    util.logger.log("page",{
                        path:path,
                        result:"fail",
                        error:e
                    });
                    info.editPage.push({path:path,result:"fail",done:false});
                }).then(function(content){
                    return topolr.file(path).write(content).done(function () {
                        util.logger.log("page",{
                            path:path,
                            result:"done"
                        });
                        info.editPage.push({path:path,result:"done",done:true});
                    },function (e,c) {
                        util.logger.log("page",{
                            path:path,
                            result:"fail"
                        });
                        info.editPage.push({path:path,result:"fail",done:false});
                    });
                });
            });
        })(ths._option.pageTemp[m]);
    }
    ps.then(function(){
        return info;
    });
    return ps;
};
builder.prototype.doLog=function (info) {
    var _info={};
    var ps=topolr.promise();
    _info["sourceFromMapping"]=this.getSourceContainer().getSourceFromMapping();
    var path=this._option.output+"topolr-builder-log.json";
    info.sourceTypeMapping=this.getSourceContainer()._sourceMap;
    info.sourceTypeMapping.outmap=[];
    this.getSourceContainer().getOutMapSource().forEach(function (a) {
        info.sourceTypeMapping.outmap.push(a.getPacketName());
    });
    _info.make=info.make;
    _info.merge=info.mergeFiles;
    _info.output=info.output;
    _info.sourceMap=info.sourceMap;
    _info.sourceTypeMapping=info.sourceTypeMapping;
    topolr.file(path).write(JSON.stringify(_info,null,4)).then(function () {
        util.logger.log("logout",path);
        ps.resolve(info);
    });
    return ps;
};
builder.prototype.dodevlog=function (info) {
    // var a={make:[],domake:[],editpage:[{path:"",result:""}],mergeFiles:[],sourceMap:{},output:[]};
    var result={};
    result["fromMapping"]=this.getSourceContainer().getSourceFromMapping();
    if(info.domake){
        var t=[];
        for(var i=0;i<info.domake.length;i++) {
            var a=info.domake[i];
            t.push({
                warn:a.getMakeWarnMessage(),
                packet:a.getPacketName(),
                path:a.getShortPath(),
                error:a.getMakeErrorMessage()
            });
        }
        result.make=t;
    }
    if(info.editPage){
        result.pages=info.editPage;
    }
    if(info.output){
        result.output=info.output;
    }
    if(info.mergeFiles){
        result.merges=info.mergeFiles;
    }
    if(info.sourceMap){
        result.map=info.sourceMap;
    }
    result.mapping=this.getSourceContainer().getSourceMapping();
    result.time=new Date().getTime();
    return topolr.promise(function (a) {
        a(result);
    });
};
builder.prototype.getcompresscontent=function (map) {
    var r=[];
    for(var i=0,len=map.length;i<len;i++){
        var cq=map[i],_r={};
        for(var q in cq) {
            var c=cq[q],type=this.getSourceContainer().getSourceTypeByAlias(q);
            for (var t = 0; t < c.length; t++) {
                var m = c[t], mt = this.getSourceContainer().getBile(m,type);
                if (mt) {
                    var type = mt.getSourceType();
                    if (!_r[type]) {
                        _r[type] = [];
                    }
                    _r[type].push({
                        p: mt.getPacketName(),
                        h: mt.getResultHash(),
                        c: mt.getResult()
                    });
                }
            }
        }
        var cont = "window.topolr.source(" + JSON.stringify(_r) + ");";
        var pth = "";
        if (this._option.debug) {
            pth = cq[this.getSourceContainer().getSourceTypeAlias("packet")][0].replace(/\./g, "-") + "-c" + c.length;
        } else {
            pth = topolr.hash.md5(cont).substring(0, 10);
        }
        r.push({
            path: pth + ".js",
            content: cont,
            name: pth,
            list: cq
        });
    }
    return r;
};
builder.prototype.allinone=function () {
    var r={packet:[],css:[],js:[],template:[],html:[],text:[],image:[],json:[]};
    var ths=this;
    var ps=topolr.promise(function (a) {
        a();
    });
    this.getSourceContainer().getSourceList().forEach(function (a) {
        var type=a.getSourceType();
        if(r[type]){
            r[type].push({
                h:null,
                p:a.getPacketName(),
                c:a.getResult()
            });
        }else {
            (function (et) {
                ps.then(function () {
                    return a.output();
                });
            })(a);
        }
    });
    var cont="window.topolr.source("+JSON.stringify(r)+");";
    ps.then(function () {
        return topolr.file(ths._option.output+"/topolr-compress-all-in-one.js").write(cont);
    });
    return ps;
};
builder.prototype.build=function(flow){
    var ths=this;
    this.getSourceContainer().renderWarn();
    var ps=topolr.promise(function(a){
        a({});
    });
    for(var i=0;i<flow.length;i++){
        (function(a){
            ps.then(function(pa){
                if(a!=="dodevlog") {
                    util.logger.log("step", a);
                }
                if(ths[a]){
                    try{
                        return ths[a](pa);
                    }catch(e){
                        console.error(e);
                    }

                }else{
                    return pa;
                }
            });
        })(flow[i]);
    }
    return ps;
};
builder.prototype.scan=function () {
    var compress=this.getSourceContainer().getSourceList();
    for(var i=0;i<compress.length;i++){
        var a=compress[i];
        console.log(">> "+a.getPacketName()+a.getSourceType()+" --> "+a.isOutMapping()+" --> "+a.getOutputSuffix());
    }
};
builder.prototype.getId=function () {
    return this._id;
};
module.exports=function (option) {
    return new builder(option);
}