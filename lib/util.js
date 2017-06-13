var Path = require("path");
var topolr = require("topolr-util");
var readline = require('readline');

var getStrByteSize = function (str) {
    var total = 0, charCode, i, len;
    for (i = 0, len = str.length; i < len; i++) {
        charCode = str.charCodeAt(i);
        if (charCode <= 0x007f) {
            total += 1;
        } else if (charCode <= 0x07ff) {
            total += 2;
        } else if (charCode <= 0xffff) {
            total += 3;
        } else {
            total += 4;
        }
    }
    return total;
};
var getSize = function (byteSize, radmon) {
    var v = 0, unit = "BYTE";
    radmon = radmon || 2;
    if (byteSize >= 1073741824) {
        v = (byteSize / 1073741824).toFixed(radmon);
        unit = "GB";
    } else if (byteSize >= 1048576) {
        v = (byteSize / 1048576).toFixed(radmon);
        unit = "MB";
    } else if (byteSize >= 1024) {
        v = (byteSize / 1024).toFixed(radmon);
        unit = "KB";
    } else {
        v = byteSize;
        unit = "B";
    }
    return v + unit;
};

var path = {
    sourceType: {
        packet: "js",
        template: "html",
        html: "html",
        js: "js",
        css: "css",
        json: "json",
        image: "png",
        text: "html"
    },
    getNormalizePath: function (path) {
        return Path.normalize(path).replace(/\\/g, "/");
    },
    getSuffix: function (path) {
        return path.split(".").pop();
    },
    getPacketName: function (basePath, path) {
        if (arguments.length === 1) {
            path = basePath;
            basePath = "";
        }
        path = this.getNormalizePath(path);
        var a = (basePath ? path.substring(basePath.length) : path).split(".");
        var suffix = a.pop();
        return a.join("-").replace(/\//g, ".") + "[" + suffix + "]";
    },
    getCurrentPath: function (path) {
        path = this.getNormalizePath(path);
        if (path[path.length - 1] === "/") {
            return path;
        } else {
            var a = path.split("/");
            a.pop();
            return a.join("/") + "/";
        }
    },
    getParentPath: function (path, times) {
        path = this.getNormalizePath(path);
        if (times === undefined) {
            times = 1;
        }
        if (times > 0) {
            if (path[path.length - 1] === "/") {
                times++;
            }
            var a = path.split("/");
            a.splice(a.length - times, times);
            return a.join("/") + "/";
        } else {
            return path;
        }
    },
    getRelativePath: function (opath, rpath) {
        opath = this.getCurrentPath(opath);
        var b = rpath.match(/^(\.{0,2}\/)+/);
        if (b) {
            rpath = rpath.substring(b[0].length);
            if (b[0] === "/") {
                return opath + rpath.substring(1);
            } else {
                var c = b[0].split("/"), len = c.length - 1;
                if (c[0] === ".") {
                    len -= 1;
                    return this.getParentPath(opath, len) + rpath;
                } else {
                    return this.getParentPath(opath, len) + rpath;
                }
            }
        } else {
            return opath + rpath;
        }
    },
    getPathByPacketName: function (basePath, packetName, type) {
        basePath = path.getCurrentPath(basePath);
        var a = packetName.split(/\[|\]/);
        var b = a[0], suffix = a[1] || (path.sourceType[type] || "js");
        return basePath + b.replace(/\./g, "/") + "." + suffix;
    },
    replacePaths: function (content, fn) {
        return content.replace(/url\(['"]*.*?["']*\)/gi, function (a) {
            var b = a.substring(4, a.length - 1).trim();
            var result = a;
            var aa = false;
            if (b[0] === "'" || b[0] === "\"") {
                aa = true;
                b = b.substring(1, b.length - 1);
            }
            var mt = b.split("?");
            b = mt[0], suffix = mt[1];
            if (/^\S+\.[a-zA-Z]+$/.test(b)) {
                var c = true;
                if (fn) {
                    c = fn(b, path.getPacketName(b));
                }
                if (c !== false) {
                    if (aa) {
                        rr = "url(\"" + c + (suffix ? ("?" + suffix) : "") + "\")";
                    } else {
                        rr = "url(" + c + (suffix ? ("?" + suffix) : "") + ")";
                    }
                    result = rr;
                }
            }
            return result;
        }).replace(/src\=['"].*?['"]/gi, function (a) {
            a = a.trim();
            var result = a;
            if (a.indexOf("<%") === -1) {
                var rp = a, mt = a.substring(5, a.length - 1).split("?"), m = mt[0], suffix = mt[1];
                if (/^\S+\.[a-zA-Z]+$/.test(m)) {
                    var ct = false;
                    if (fn) {
                        ct = fn(m, path.getPacketName(m));
                    }
                    if (ct !== false) {
                        result = "src=\"" + ct + (suffix ? ("?" + suffix) : "") + "\"";
                    }
                }
            }
            return result;
        }).replace(/\@import.*?\;/gi, function (str) {
            var a = str.substring(7, str.length - 1).trim();
            if (a[0] === "'" || a[0] === "\"") {
                a = a.substring(1, a.length - 1).trim();
                if (/^\S+\.[a-zA-Z]+$/.test(a)) {
                    var ct = false;
                    if (fn) {
                        ct = fn(a, path.getPacketName(a));
                    }
                    if (ct !== false) {
                        result = "@import \"" + ct + "\";";
                    }
                }
            }
            return result;
        });
    },
    findPaths: function (content) {
        var r = [];
        var a = content.match(/url\(['"]*.*?["']*\)/gi);
        if (a) {
            for (var i = 0; i < a.length; i++) {
                var b = a[i].substring(4, a[i].length - 1).trim();
                if (b[0] === "'" || b[0] === "\"") {
                    aa = true;
                    b = b.substring(1, b.length - 1);
                }
                b = b.split("?")[0];
                if (/^\S+\.[a-zA-Z]+$/.test(b)) {
                    r.push(b);
                }
            }
        }
        var e = content.match(/src\=['"].*?['"]/gi);
        if (e) {
            for (var i = 0; i < e.length; i++) {
                var a = e[i];
                if (a.indexOf("<%") === -1) {
                    var rp = a, path = a.substring(5, a.length - 1).split("?")[0];
                    if (/^\S+\.[a-zA-Z]+$/.test(path)) {
                        r.push(path);
                    }
                }
            }
        }
        var f = content.match(/\@import.*?\;/gi);
        if (f) {
            for (var i = 0; i < f.length; i++) {
                var a = f[i].substring(7, f[i].length - 1).trim();
                if (a[0] === "'" || a[0] === "\"") {
                    a = a.substring(1, a.length - 1).trim();
                    if (/^\S+\.[a-zA-Z]+$/.test(a)) {
                        r.push(a);
                    }
                }
            }
        }
        return r;
    },
    findPathsMap: function (content) {
        var r = {
            url: [],
            src: [],
            import: []
        };
        var a = content.match(/url\(['"]*.*?["']*\)/gi);
        if (a) {
            for (var i = 0; i < a.length; i++) {
                var b = a[i].substring(4, a[i].length - 1).trim();
                if (b[0] === "'" || b[0] === "\"") {
                    aa = true;
                    b = b.substring(1, b.length - 1);
                }
                b = b.split("?")[0];
                if (/^\S+\.[a-zA-Z]+$/.test(b)) {
                    r.url.push(b);
                }
            }
        }
        var e = content.match(/src\=['"].*?['"]/gi);
        if (e) {
            for (var i = 0; i < e.length; i++) {
                var a = e[i];
                if (a.indexOf("<%") === -1) {
                    var rp = a, path = a.substring(5, a.length - 1).split("?")[0];
                    if (/^\S+\.[a-zA-Z]+$/.test(path)) {
                        r.src.push(path);
                    }
                }
            }
        }
        var f = content.match(/\@import.*?\;/gi);
        if (f) {
            for (var i = 0; i < f.length; i++) {
                var a = f[i].substring(7, f[i].length - 1).trim();
                if (a[0] === "'" || a[0] === "\"") {
                    a = a.substring(1, a.length - 1).trim();
                    if (/^\S+\.[a-zA-Z]+$/.test(a)) {
                        r.import.push(a);
                    }
                }
            }
        }
        return r;
    }
};
var packet = {
    i: /\r\n/g,
    k: /\r/g,
    l: /\n/g,
    f: />[\s]+</g,
    isdot: /\./g,
    issuffix: /\[.*\]/g,
    isNote: /\/\*[\w\W]*?\*\//,
    isNoteall: /\/\*[\w\W]*?\*\//g,
    isInfo: /@([\s\S]*?);/g,
    isPacketTag: /["\']@[A-Za-z0-9_\[\]-]+\.[A-Za-z0-9_-]*["\']/g,
    isCurrentTag: /["\']@\.[A-Za-z0-9_-]+["\']/g,
    isProjectPathTag: /require\(["\']\/[\/\.A-Za-z0-9_-]+["\']/g,
    isPacket: /["\']@[A-Za-z0-9_\[\]-]+["\']/g,
    isOther: /["\']\\@[A-Za-z0-9_-]+["\']/g,
    issuffixp: /\[|\]/,
    getPacketInfo: function (_content) {
        var n = {_depends: []};
        n._packetName = "nopacket";
        if (_content) {
            var str = _content;
            var a = str.match(packet.isNote);
            if (a && a.length > 0) {
                var b = a[0];
                var tp = b.match(packet.isInfo);
                if (tp) {
                    n._note = b;
                    for (var o = 0; o < tp.length; o++) {
                        var a = tp[o], d = a.split(" ");
                        if (d.length >= 2) {
                            var key = d[0].substring(1, d[0].length),
                                value = d[1][d[1].length - 1] === ";" ? d[1].substring(0, d[1].length - 1) : d[1],
                                suffix = value.split(packet.issuffixp)[1] || "",
                                shortname = value.split(":")[1] ? value.split(":")[1] : value.split(".").pop();
                            value = value.split(":")[0];
                            if (!n["_" + key]) {
                                n["_" + key] = [];
                            }
                            if (key !== "image" && key !== "text" && key !== "map") {
                                value = value.replace(packet.issuffix, "");
                            }
                            var info = value;
                            if (key === "packet") {
                                n._packetName = value;
                            }
                            if (key === "require") {
                                n._require.push(value);
                                n._depends.push({type: "packet", value: value});
                            }
                            if (key === "include") {
                                n._include.push(value);
                                n._depends.push({type: "packet", value: value});
                            }
                            if (key === "js") {
                                if (value.indexOf("http") !== -1) {
                                    info.path = value;
                                }
                            }
                            if (["css", "js", "template", "image", "json", "text", "style"].indexOf(key) !== -1) {
                                n._depends.push({type: key, value: value});
                            }
                            if (n["_" + key].indexOf(info) === -1) {
                                if (n["_" + key].push) {
                                    n["_" + key].push(info);
                                }
                            }
                        }
                    }
                }
            } else {
                n._packetName = "nopacket";
            }
        }
        return n;
    },
    isPacket: function (_content) {
        var n = "";
        if (_content) {
            var str = _content;
            var a = str.match(packet.isNote);
            if (a && a.length > 0) {
                var b = a[0];
                var tp = b.match(packet.isInfo);
                if (tp) {
                    for (var o = 0; o < tp.length; o++) {
                        var a = tp[o], d = a.split(" ");
                        if (d.length >= 2) {
                            var key = d[0].substring(1, d[0].length),
                                value = d[1][d[1].length - 1] === ";" ? d[1].substring(0, d[1].length - 1) : d[1],
                                suffix = value.split(packet.issuffixp)[1] || "",
                                shortname = value.split(":")[1] ? value.split(":")[1] : value.split(".").pop();
                            value = value.split(":")[0];
                            if (key === "packet") {
                                n = value;
                                break;
                            }
                        }
                    }
                }
            }
        }
        return n !== "";
    },
    cleanHeadCommet: function (_content) {
        var n = {_depends: []};
        n._packetName = "nopacket";
        if (_content) {
            var str = _content;
            var a = str.match(packet.isNote);
            if (a && a.length > 0) {
                var b = a[0];
                var tp = b.match(packet.isInfo);
                if (tp) {
                    var cd = _content.replace(packet.isNoteall, "");
                    var num = 0;
                    for (var i = 0; i < cd.length; i++) {
                        if (cd[i] !== "\r" && cd[i] !== "\n") {
                            num = i;
                            break;
                        }
                    }
                    cd = cd.substring(num);
                    return cd;
                }
            }
        }
        return _content;
    }
};
var array = {
    concat: function () {
        var r = [];
        var a = Array.prototype.slice.call(arguments);
        for (var i = 0; i < a.length; i++) {
            r.concat(a[i]);
        }
        return r;
    },
    disconcat: function () {
        var r = [];
        var a = Array.prototype.slice.call(arguments);
        for (var i = 0; i < a.length; i++) {
            var b = a[i];
            for (var j = 0; j < b.length; j++) {
                if (r.indexOf(b[j]) === -1) {
                    r.push(b[j]);
                }
            }
        }
        return r;
    }
};

var logger = {
    log: function (type, info) {
        if (logger[type]) {
            if (process.stderr.isTTY) {
                logger[type].call(logger, info);
            }
        }
    },
    binfo: function (info) {
        process.stderr.write("\n");
        process.stderr.write(topolr.logText("(color:green=> topolr-builter v{{a}})", {a: info.version}));
        process.stderr.write("\n");
        process.stderr.write(topolr.logText("(color:green=>   built {{a}}", {a: info.basePath}));
        process.stderr.write("\n");
        process.stderr.write(topolr.logText("(color:green=>   import from node_modules"));
        process.stderr.write("\n");
        for (var i in info.imports) {
            process.stderr.write(topolr.logText("(color:green=>     dependencies: [ {{a}} ]", {a: info.imports[i].id}));
            process.stderr.write("\n");
        }
        process.stderr.write(topolr.logText("(color:green=>   files[{{a}}] packet[{{b}}] template[{{c}}] js[{{d}}] css[{{e}}] text[{{f}}] image[{{g}}] json[{{h}}] html[{{j}}])", {
            a: info.total,
            b: info.packet,
            c: info.template,
            d: info.js,
            e: info.css,
            f: info.text,
            g: info.image,
            h: info.json,
            j: info.html
        }));
        process.stderr.write("\n");
        process.stderr.write("\n");
    },
    step: function (step) {
        process.stderr.write(topolr.logText("(color:green=> [-{{a}}-])", {a: step.toUpperCase().substring(2)}));
        process.stderr.write("\n");
    },
    make: function (bile) {
        this._make.push(1);
        if (this._make.length < 20) {
            if (bile.isImport()) {
                topolr.log("  - (color:68=>[{{num}}] [{{packet}}]) {{path}} (color:yellow=>w[{{warn}}]) (color:red=>e[{{error}}]) (color:68=>[{{depends}}] )", {
                    packet: bile.getPacketName(),
                    path: bile.getShortPath(),
                    num: this._make.length,
                    warn: bile.getMakeWarnMessage().length,
                    error: bile.getMakeErrorMessage().length,
                    depends: bile.getImportInfo().id
                });
            } else {
                topolr.log("  - (color:68=>[{{num}}] [{{packet}}]) {{path}} (color:yellow=>w[{{warn}}]) (color:red=>e[{{error}}])", {
                    packet: bile.getPacketName(),
                    path: bile.getShortPath(),
                    num: this._make.length,
                    warn: bile.getMakeWarnMessage().length,
                    error: bile.getMakeErrorMessage().length
                });
            }
        } else {
            process.stderr.clearLine();
            process.stderr.cursorTo(0);
            process.stderr.write(topolr.logText("  + (color:68=>[{{length}}] hidden) {{path}} (color:green=>done)", {
                length: this._make.length,
                path: bile.getShortPath()
            }));
        }
    },
    makestart: function () {
        this._make = [];
    },
    makedone: function () {
        process.stderr.clearLine();
        process.stderr.cursorTo(0);
        if (this._make.length > 20) {
            process.stderr.write(topolr.logText("  + (color:68=>[{{length}}] hidden)", {length: this._make.length}));
            process.stderr.write("\n");
        }
        if (this._make.length === 0) {
            process.stderr.write(topolr.logText("  (color:68=>[NO FILE TO MAKE])"));
            process.stderr.write("\n");
        }
        this._make = [];
    },
    makeinfo: function (compress) {
        var w = [], e = [];
        for (var i = 0, len = compress.length; i < len; i++) {
            var a = compress[i];
            if (a.getMakeWarnMessage().length > 0) {
                w.push({
                    info: a.getMakeWarnMessage(),
                    packet: a.getPacketName(),
                    path: a.getShortPath()
                });
            }
            if (a.getMakeErrorMessage().length > 0) {
                e.push({
                    info: a.getMakeErrorMessage(),
                    packet: a.getPacketName(),
                    path: a.getShortPath()
                });
            }
        }
        if (w.length > 0) {
            process.stderr.write("\n");
            topolr.log("    (color:148;decoration:bold=>[WARN])");
            for (var i = 0; i < w.length; i++) {
                topolr.log("  - (color:68=>[{{packet}}]) {{path}}", w[i]);
                for (var j = 0; j < w[i].info.length; j++) {
                    topolr.log("     (color:75=>-[{{num}}]) (color:47=>{{info}})", {info: w[i].info[j], num: j + 1});
                    if (j === w[i].info.length - 1) {
                        process.stderr.write("\n");
                    }
                }
            }
        }
        if (e.length > 0) {
            process.stderr.write("\n");
            topolr.log("   (color:red;decoration:bold=>[ERROR])");
            for (var i = 0; i < e.length; i++) {
                topolr.log("  - (color:68=>[{{packet}}]) {{path}})", e[i]);
                for (var j = 0; j < e[i].info.length; j++) {
                    topolr.log("     (color:75=>-[{{num}}]) (color:red=>{{info}})", {info: e[i].info[j], num: j + 1});
                    if (j === e[i].info.length - 1) {
                        process.stderr.write("\n");
                    }
                }
            }
        }
    },
    output: function (bile) {
        this._output.push(1);
        if (this._output.length < 20) {
            if (bile.isImport()) {
                topolr.log("  - (color:68=>[{{num}}] [{{packet}}]) (color:148=>[{{out}}]) {{path}} (color:32=>[{{size}}]) (color:green=>[done]) (color:68=>[{{depends}}] )", {
                    packet: bile.getPacketName(),
                    out: bile.isMapOut() ? "out" : "map",
                    path: bile.getShortPath(),
                    num: this._output.length,
                    size: bile.getResultSize(),
                    depends: bile.getImportInfo().id
                });
            } else {
                topolr.log("  - (color:68=>[{{num}}] [{{packet}}]) (color:148=>[{{out}}]) {{path}} (color:32=>[{{size}}]) (color:green=>[done])", {
                    packet: bile.getPacketName(),
                    out: bile.isMapOut() ? "out" : "map",
                    path: bile.getShortPath(),
                    num: this._output.length,
                    size: bile.getResultSize()
                });
            }
        } else {
            process.stderr.clearLine();
            process.stderr.cursorTo(0);
            process.stderr.write(topolr.logText("  + (color:68=>[{{length}}] hidden) (color:148=>[{{out}}]) {{path}} (color:green=>[done])", {
                length: this._output.length,
                out: bile.isMapOut() ? "out" : "map",
                path: bile.getShortPath()
            }));
        }
    },
    outputstart: function () {
        this._output = [];
    },
    outputdone: function () {
        process.stderr.clearLine();
        process.stderr.cursorTo(0);
        if (this._output.length > 20) {
            process.stderr.write(topolr.logText("  + (color:68=>[{{length}}] hidden)", {length: this._output.length}));
            process.stderr.write("\n");
        }
        if (this._output.length === 0) {
            process.stderr.write(topolr.logText("  (color:68=>[NO FILE TO OUTPUT])"));
            process.stderr.write("\n");
        }
        this._output = [];
    },
    merge: function (info) {
        this._merge.push(1);
        info.num = this._merge.length;
        info.size = getSize(info.size);
        info.result = info.result ? "done" : "fail";
        if (this._merge.length < 20) {
            topolr.log("  - (color:68=>[{{num}}] [{{path}}]) (color:148=>[{{size}}]) (color:green=>[{{result}}])", info);
        } else {
            process.stderr.clearLine();
            process.stderr.cursorTo(0);
            process.stderr.write(topolr.logText("  + (color:68=>[{{num}}] hidden) {{path}} (color:green=>[{{result}}])", info));
        }
    },
    mergestart: function () {
        this._merge = [];
    },
    mergedone: function () {
        process.stderr.clearLine();
        process.stderr.cursorTo(0);
        if (this._merge.length > 20) {
            process.stderr.write(topolr.logText("  + (color:68=>[{{length}}] hidden)", {length: this._merge.length}));
            process.stderr.write("\n");
        }
        if (this._merge.length === 0) {
            process.stderr.write(topolr.logText("  (color:68=>[NO FILE TO MERGE])"));
            process.stderr.write("\n");
        }
        this._merge = [];
    },
    page: function (info) {
        process.stderr.clearLine();
        process.stderr.cursorTo(0);
        if (info.result === "fail") {
            process.stderr.write(topolr.logText("  - (color:68=>[{{path}}]) (color:red=>[{{result}}])", info));
        } else {
            process.stderr.write(topolr.logText("  - (color:68=>[{{path}}]) (color:green=>[{{result}}])", info));
        }
        process.stderr.write("\n");
        if (info.result === "fail") {
            var desc = info.error;
            process.stderr.write("\n");
            process.stderr.write(topolr.logText("    (color:red=>[ERROR])"));
            process.stderr.write("\n");
            process.stderr.write(topolr.logText("  (color:red=>- [1] {{desc}})", {desc: desc.stack || desc}));
            process.stderr.write("\n\n");
        }
    },
    logout: function (path) {
        process.stderr.clearLine();
        process.stderr.cursorTo(0);
        process.stderr.write(topolr.logText("  - (color:68=>[{{path}}]) (color:green=>[done])", {path: path}));
        process.stderr.write("\n");
    },
    line: function (first) {
        if (!first) {
            var t = new Date();
            var _y = t.getFullYear(), _m = (t.getMonth() + 1), _d = t.getDate(), _h = t.getHours(),
                _mi = t.getMinutes(), _s = t.getSeconds();
            var p = _y + "-" + (_m < 10 ? ("0" + _m) : _m) + "-" + (_d < 10 ? ("0" + _d) : _d) +
                " " + (_h < 10 ? ("0" + _h) : _h) + ":" + (_mi < 10 ? ("0" + _mi) : _mi) + ":" + (_s < 10 ? ("0" + _s) : _s);
            process.stderr.write("\n");
            process.stderr.write("  +" + topolr.logText("(color:11=> BUILT TIME : {{time}})", {time: p}));
            process.stderr.write("\n\n");
        }
    },
    warn: function (desc) {
        topolr.log("    (color:11=>[{{desc}}])", {desc: desc});
    },
    info: function (desc) {
        topolr.log("    (color:11=>{{desc}})", {desc: desc});
    },
    error: function (desc) {
        topolr.log("    (color:red=>{{desc}})", {desc: desc.stack || desc});
    },
    nopacket: function (info) {
        var t = topolr.logText(" (color:47=> - [{{num}}] packet not find sourceType: )", {num: info.num}) +
            topolr.logText("(color:11=>[{{type}}])", {type: info.type}) +
            topolr.logText("(color:47=> packetName: )") +
            topolr.logText("(color:11=>[{{name}}])", {name: info.packet});
        topolr.log(t);
    },
    nopackete: function (info) {
        var t = topolr.logText(" (color:red=> - [{{num}}] {{msg}}: )", {num: info.num, msg: info.msg}) +
            topolr.logText("(color:11=>[{{type}}])", {type: info.type}) +
            topolr.logText("(color:47=> packetName: )") +
            topolr.logText("(color:11=>[{{name}}])", {name: info.packet});
        topolr.log(t);
    },
    containerwarn: function (info) {
        var has = false;
        for (var i in info) {
            has = true;
        }
        if (has) {
            process.stderr.write(topolr.logText("(color:11=> [-WARN-])"));
            process.stderr.write("\n");
            var et = info;
            for (var i in et) {
                for (var t in et[i]) {
                    et[i][t].num = t / 1 + 1;
                    logger.log(i, et[i][t]);
                }
            }
        }
    },
    containererror: function (info) {
        var has = false;
        for (var i in info) {
            has = true;
        }
        if (has) {
            process.stderr.write(topolr.logText("(color:red=> [-ERROR-])"));
            process.stderr.write("\n");
            var et = info;
            for (var i in et) {
                for (var t in et[i]) {
                    et[i][t].num = t / 1 + 1;
                    logger.log(i, et[i][t]);
                }
            }
        }
    },
    ignore: function (info) {
        process.stderr.write(topolr.logText("(color:68=> [-IGNORE-])"));
        process.stderr.write("\n");
        var num = 0;
        for (var i = 0; i < info.length; i++) {
            num++;
            if (num < 20) {
                topolr.log("  - (color:68=>[{{num}}] [{{path}}]))", {
                    num: num,
                    path: info[i]
                });
            } else {
                process.stderr.clearLine();
                process.stderr.cursorTo(0);
                process.stderr.write(topolr.logText("  + (color:68=>[{{num}}] hidden) {{path}}", {
                    num: num,
                    path: info[i]
                }));
            }
        }
        if (num >= 20) {
            process.stderr.write("\n");
        }
    },
    socket: function (port) {
        topolr.log("  (color:yellow=>chrome extension service is start port is [{{port}}])", {port: port});
    }
};
module.exports = {
    path: path,
    packet: packet,
    array: array,
    logger: logger,
    getStrByteSize: getStrByteSize,
    getSize: getSize,
    editPage: function () {
        var prop = ["sitePath", "basePath", "title", "description", "keywords", "map", "debug"];
    },
    parseJson: function (str) {
        var st = "", objs = [], r = {};
        var key = "", val = "", isval = false, valstart = "";
        for (var i = 0; i < str.length; i++) {
            var a = str[i];
            if (a === "{") {
                objs.push("");
                if (objs.length > 1 && isval) {
                    val += a;
                }
            } else if (a === "}") {
                objs.pop();
                if (objs.length === 1) {
                    isval = false;
                    r[key] = val;
                    key = "";
                    val = "";
                } else {
                    val += a;
                }
            } else if (a === ":") {
                isval = true;
                if (str[i + 1] === "\"" || str[i + 1] === "'") {
                    valstart = str[i + 1];
                } else {
                    valstart = "";
                }
                if (objs.length > 1 && isval) {
                    val += a;
                }
            } else if (a === ",") {
                if (objs.length === 1) {
                    if (!valstart || str[i - 1] === valstart) {
                        isval = false;
                        r[key] = val;
                        key = "";
                        val = "";
                    } else {
                        val += a;
                    }
                } else {
                    val += a;
                }
            } else {
                if (isval) {
                    val += a;
                } else {
                    key += a;
                }
            }
        }
        return r;
    }
}