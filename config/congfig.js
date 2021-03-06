module.exports={
    basePath: "",
    bootPacket:"",
    bootFolder:"",
    output:"../dist/",
    debug:true,
    pageTemp:"",
    outMap:false,
    devport:8099,
    sourceType:{
        packet:"js",
        html:"html",
        template:"html",
        js:"js",
        css:"css",
        style:"css",
        text:"txt",
        json:"json",
        image:"png"
    },
    sourceTypeAlias:{
        packet:"p",
        template:"t",
        js:"j",
        style:"y",
        css:"c",
        text:"n",
        json:"s",
        image:"i",
        map:"m",
        html:"h"
    },
    ignore:["*.DS_Store","*.*___jb_tmp___"],
    maker:{
        jsmaker:require("../maker/jsmaker"),
        lessparser:require("../maker/lessparser"),
        sassparser:require("../maker/sassparser"),
        cssmaker:require("../maker/cssmaker"),
        testmaker:require("../maker/testmaker"),
        cssprefixmaker:require("../maker/cssprefixmaker"),
        htmlmaker:require("../maker/htmlmaker"),
        mdparser:require("../maker/mdparser"),
        jsonmaker:require("../maker/jsonmaker"),
        templatemaker:require("../maker/templatemaker"),
        babelmaker:require("../maker/babelmaker")
    },
    makerOption:{},
    sequnce:{
        js:["jsmaker"],
        css:["cssprefixmaker","cssmaker"],
        less:["lessparser","cssprefixmaker","cssmaker"],
        scss:["sassparser","cssprefixmaker","cssmaker"],
        style:["sassparser","cssprefixmaker","cssmaker"],
        md:["mdparser","htmlmaker"],
        html:["htmlmaker"],
        json:["jsonmaker"],
        template:["templatemaker"],
        babel:["babelmaker","jsmaker"]
    },
    outmapSequnce:{
        js:{step:["jsmaker"],to:"js"},
        css:{step:["cssprefixmaker","cssmaker"],to:"css"},
        less:{step:["lessparser","cssprefixmaker","cssmaker"],to:"css"},
        scss:{step:["sassparser","cssprefixmaker","cssmaker"],to:"css"},
        style:{step:["sassparser","cssprefixmaker","cssmaker"],to:"css"},
        md:{step:["mdparser","htmlmaker"],to:"html"},
        html:{step:["htmlmaker"],to:"html"},
        json:{step:["jsonmaker"],to:"json"},
        babel:{step:["babelmaker","jsmaker"],to:"json"}
    }
};