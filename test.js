var builder=require("./main");
builder.publish({
    cwd:"G:/ubroad/ubroad",
    basePath:"G:/ubroad/ubroad/app/src/",
    bootPacket:"option.root",
    bootFolder:"page/",
    maker:{
        etest:function(content,option,done){
            done(content);
        }
    },//maker mapping
    makerOption:{
        jsmaker:{
            compress:{
                drop_console:true
            }
        }
    },
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