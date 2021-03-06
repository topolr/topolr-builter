var topolr = require("topolr-util");
var parser = require("./parser");

var builter = {
    getSymbolStr: function (name, path) {
        var svg = parser.create("svg", {
            style: "position: absolute; width: 0; height: 0; overflow: hidden;",
            version: "1.1",
            xmlns: "http://www.w3.org/2000/svg",
            packet: "icon." + name
        });
        var defs = parser.create("defs", {});
        var contents = [];
        if (topolr.is.isString(path)) {
            path = path + "/";
            topolr.file(path).scan(function (path) {
                if (topolr.file(path).suffix() === "svg") {
                    contents.push(topolr.file(paths[i]).readSync());
                }
            });
        } else {
            contents = path;
        }
        for (var i = 0; i < contents.length; i++) {
            var nodearray = parser.parse(contents[i]);
            for (var t = 0; t < nodearray.length; t++) {
                var title = "";
                if (nodearray[t].getChild(0).getChild(0)) {
                    title = nodearray[t].getChild(0).getChild(0).content;
                    nodearray[t].getChild(0).getChild(0).content = "";
                } else {
                    var a = paths[i].split("/").pop();
                    title = a.substring(0, a.length - 4);
                }
                nodearray[t].setTagName("symbol").removeAttr(["version", "xmlns", "width", "height"]).setAttr({
                    id: "t-icon-" + title
                });
                defs.addChild(nodearray[t]);
            }
        }
        svg.addChild(defs);
        return svg.str();
    },
    getSvgScript: function (name, sourcepath) {
        var str = builter.getSymbolStr(name, sourcepath);
        var content = topolr.file(require("path").resolve(__dirname, "./codetemp.tpl")).readSync();
        return content.replace(/\#\#NAME\#\#/g, name).replace(/\#\#SVGCONTENT\#\#/g, JSON.stringify(str));
    },
    outputFile: function (name, sourcepath, outputpath) {
        return topolr.file(outputpath).write(builter.getSvgScript(name, sourcepath));
    }
};

module.exports = builter;