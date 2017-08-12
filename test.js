var builder=require("./main");
builder.develop({
    cwd:"/Users/wangjinliang/git/topolr-module-sdata/",
    basePath:"/Users/wangjinliang/git/topolr-module-sdata/com/topolr/",
    bootPacket:"sdata.test",
    bootFolder:"sdata",
    maker:{
        etest:function(content,option,done){
            done(content);
        }
    },//maker mapping
    ignore:["a/a.js"],
    develop:{
        output:"../dist/",
        pageTemp:["./../../index.nsp"],
        outMap:false,//out map file is or not make
        sequnce:{},//make sequnce
        outmapSequnce:{},//out map file make sequnce
    },
    publish:{
        output:"../publish/",
        pageTemp:["./../../index.nsp"],
        outMap:false,//out map file is or not make
        sequnce:{},//make sequnce
        outmapSequnce:{},//out map file make sequnce
    }
});