var topolr=require("topolr-util");
var util=require("./../../lib/util");
var package=require("./../../package");
module.exports= {
    command: "init",
    desc: "make topolr-builter-config.js file",
    paras: [],
    fn: function (parameters, cellmapping, allmapping) {
        var path=process.cwd().replace(/\\/g,"/");
        var filepath=path+ "/topolr-builter-config.js";
        if(!topolr.file(filepath).isExists()){
         var str="/*\n";
            str+=" * topolr-builter version "+package.version+"\n";
            str+=" * built product developed by topolr web framework\n";
            str+=" * topolr-builter-config:\n";
            str+=" *   basePath      - app base path\n";
            str+=" *   bootPacket    - app boot packet\n";
            str+=" *   bootFolder    - app top packet folder\n";
            str+=" *   develop       - develop mapping,when trigger develop\n";
            str+=" *   publish       - develop mapping,when trigger publish\n";
            str+=" *   output        - output folder,relative basePath\n";
            str+=" *   pageTemp      - boot index page,relative basePath\n";
            str+=" *   outMap        - out map file is or not make\n";
            str+=" *   devport       - develop mode will open a socket service to connect to chrome extension\n";
            str+=" *   ignore        - scan without files\n";
            str+=" *       -default:['*.DS_Store','*.*___jb_tmp___']\n";
            str+=" *   maker         - custom maker mapping\n";
            str+=" *       -like:{makerName:function(content,option,done){\n";
            str+=" *                   done(dosomethind(content,option));\n";
            str+=" *              }}\n";
            str+=" *       -default maker:\n";
            str+=" *         'jsmaker','lessparser','sassparser','cssmaker','cssprefixmaker'\n";
            str+=" *         'htmlmaker','mdparser','jsonmaker','templatemaker','babelmaker'\n";
            str+=" *   makerOption   - custom maker option {makerName:{}}\n";
            str+=" *   sequnce       - make sequnce\n";
            str+=" *       -default sequnce:\n";
            str+=" *          js:['jsmaker']\n";
            str+=" *          css:['cssprefixmaker','cssmaker']\n";
            str+=" *          less:['lessparser','cssprefixmaker','cssmaker']\n";
            str+=" *          scss:['sassparser','cssprefixmaker','cssmaker']\n";
            str+=" *          md:['mdparser','htmlmaker']\n";
            str+=" *          html:['htmlmaker']\n";
            str+=" *          json:['jsonmaker']\n";
            str+=" *          template:['templatemaker']\n";
            str+=" *          babel:['babelmaker','jsmaker']\n";
            str+=" *   outmapSequnce - out map file make sequnce\n";
            str+=" *       -default outmapSequnce:\n";
            str+=" *          js:{step:['jsmaker'],to:'js'}\n";
            str+=" *          css:{step:['cssprefixmaker','cssmaker'],to:'css'}\n";
            str+=" *          less:{step:['lessparser','cssprefixmaker','cssmaker'],to:'css'}\n";
            str+=" *          scss:{step:['sassparser','cssprefixmaker','cssmaker'],to:'css'}\n";
            str+=" *          md:{step:['mdparser','htmlmaker'],to:'html'}\n";
            str+=" *          html:{step:['htmlmaker'],to:'html'}\n";
            str+=" *          json:{step:['jsonmaker'],to:'json'}\n";
            str+=" *          babel:{step:['babelmaker','jsmaker'],to:'json'}\n";
            str+=" */\n\n";
            str+="module.exports={\n";
            str+="    basePath:\"./app/src/\",\n";
            str+="    bootPacket:\"option.root\",\n";
            str+="    bootFolder:\"option/\",\n";
            str+="    maker:{},\n";
            str+="    develop:{\n";
            str+="        output:\"../dist/\",\n";
            str+="        pageTemp:\"./../../index.nsp\",\n";
            str+="        outMap:false,\n";
            str+="        sequnce:{},\n";
            str+="        outmapSequnce:{},\n";
            str+="        devport:8099,\n";
            str+="    },\n";
            str+="    publish:{\n";
            str+="        output:\"../publish/\",\n";
            str+="        pageTemp:\"./../../index.nsp\",\n";
            str+="        outMap:false,\n";
            str+="        sequnce:{},\n";
            str+="        outmapSequnce:{}\n";
            str+="    }\n";
            str+="};\n";
            topolr.file(filepath).write(str).then(function () {
                util.logger.log("info","You can edit the topolr-builter-config.js");
            });
        }else{
            util.logger.log("info","The topolr-builter-config.js is exist");
        }
    }
};