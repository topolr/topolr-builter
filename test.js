var builder=require("./main");
builder.develop({
    // basePath: "/Users/wangjinliang/caplr/topolr-blog/front/src/",
    // basePath: "/Users/wangjinliang/caplr/topolr-doc/app/src/",
    basePath:"/Users/wangjinliang/git/topolr-blog/app/src/",
    // basePath:"G:/caplr/simplemd/app/src/",
    bootPacket:"option.root",
    bootFolder:"option/",
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