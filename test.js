var builder=require("./main");
builder.develop({
    cwd:"/Users/wangjinliang/ubroad/ubroad",
    basePath:"/Users/wangjinliang/ubroad/ubroad/app/src/",
    bootPacket:"option.root",
    bootFolder:"page/",
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