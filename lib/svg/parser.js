var topolr=require("topolr-util");
var node = function (tag, props) {
    this.tag = tag || "";
    this.props = props || {};
    this.hasProp = false;
    this.children = [];
    this.parent = null;
};
node.isDoctype = /\<\!DOCTYPE[\s\S]*?\>/g;
node.isNote = /\<\!\-\-[\s\S]*?\-\-\>/g;
node.isXmlTag = /\<\?[\s\S]*?\?\>/g;
node.filter = function (str) {
    str = str.trim();
    return str.replace(node.isNote, "").replace(node.isDoctype, "").replace(node.isXmlTag, "");
};
node.repairTag = function (str) {
    var tags = ["br", "hr", "img", "input", "param", "link", "meta", "area", "base", "basefont", "param", "col", "frame", "embed", "keygen", "source"];
    for (var i = 0; i < tags.length; i++) {
        var reg = new RegExp("<" + tags[i] + " .*?>", "g");
        str = str.replace(reg, function (a) {
            return a.substring(0, a.length - 1) + "/>";
        })
    }
    return str;
};
node.parse = function (str) {
    if (str && str !== "") {
        str = node.filter(str);
        str = node.repairTag(str);
        var stacks = [], nodes = [], current = null;
        var tagname = "", tagendname = "", propname = "", value = "", text = "";
        var tagnamestart = false, propstart = false, valuestart = false, tagendstart = false, element = false;
        for (var i = 0, len = str.length; i < len; i++) {
            var a = str[i];
            if (a !== "\r" && a !== "\n") {
                if (a === "<") {
                    element = true;
                    if (text.trim() !== "") {
                        current = new tnode(text.trim(), stacks[stacks.length - 1] || null);
                        if (stacks[stacks.length - 1]) {
                            stacks[stacks.length - 1].children.push(current);
                        } else {
                            nodes.push(current);
                        }
                        text = "";
                    }
                    if (str[i + 1] && str[i + 1] === "/") {
                        tagendstart = true;
                    } else {
                        current = new node();
                        stacks.push(current);
                        if (stacks.length - 2 >= 0) {
                            stacks[stacks.length - 2].children.push(current);
                            current.parent = stacks[stacks.length - 2];
                        }
                        tagnamestart = true;
                    }
                    continue;
                } else if (a === " ") {
                    if (element) {
                        if (tagnamestart) {
                            tagnamestart = false;
                            current.tag = tagname.trim();
                            tagname = "";
                        }
                        if (!propstart && !valuestart) {
                            propstart = true;
                            continue;
                        }
                    }
                } else if (a === "=") {
                    element && (propstart = false);
                } else if (a === "'" || a === "\"") {
                    if (!valuestart && element) {
                        valuestart = a;
                        continue;
                    } else {
                        if (valuestart === a) {
                            valuestart = false, current.hasProp = true;
                            current.props[propname.trim()] = value.trim();
                            propname = "", value = "";
                        }
                    }
                } else if (a === ">") {
                    element = false, propstart = false, valuestart = false, tagnamestart = false;
                    if (tagendstart) {
                        tagendstart = false, tagendname = "";
                        stacks.length === 1 && (nodes.push(stacks[0]));
                        stacks.pop();
                    }
                    if (!current.hasProp) {
                        current.tag === "" && (current.tag = tagname.trim());
                        tagname = "";
                    }
                    continue;
                } else if (a === "/") {
                    if (str[i + 1] && str[i + 1] === ">") {
                        element = false, valuestart = false, propstart = false, tagendstart = false, tagnamestart = false, tagendname = "";
                        if (stacks.length === 1) {
                            nodes.push(stacks[0]);
                        }
                        if (!current.hasProp) {
                            current.tag === "" && (current.tag = tagname.trim());
                            tagname = "";
                        }
                        stacks.pop();
                    } else {
                        if(!element){
                            text+=a;
                        }else{
                            valuestart && (value += a);
                        }
                    }
                    continue;
                }
                tagnamestart && (tagname += a);
                propstart && (propname += a);
                valuestart && (value += a);
                tagendstart && (tagendname += a);
                !element && (text += a);
            }
        }
        if (text) {
            nodes.push(new tnode(text, null));
        }
        return nodes;
    } else {
        return [];
    }
};
node.prototype.str=function () {
    var str = "<" + this.tag;
    if (this.props) {
        for (var i in this.props) {
            str += " " + i + "=\"" + this.props[i] + "\"";
        }
    }
    if(this.children.length>0){
        str += ">";
    }
    for (var i = 0; i < this.children.length; i++) {
        if(this.children[i]){
            str += this.children[i].str();
        }
    }
    if (this.children.length<=0) {
        str += "/>";
    } else {
        str += "</" + this.tag + ">";
    }
    return str;
};
node.prototype.removeAttr=function (key) {
    if(topolr.is.isString()) {
        delete this.props[key];
    }else if(topolr.is.isArray(key)){
        for(var i=0;i<key.length;i++){
            delete this.props[key[i]];
        }
    }
    return this;
};
node.prototype.setAttr=function (key,value) {
    if(arguments.length===2) {
        this.props[key] = value;
    }else if(arguments.length===1){
        for(var i in key){
            this.props[i]=key[i];
        }
    }
    return this;
};
node.prototype.setTagName=function (name) {
    this.tag=name;
    return this;
};
node.prototype.getChild=function (index) {
    return this.children[index];
};
node.prototype.addChild=function (child) {
    this.children.push(child);
};

var tnode = function (content, parent) {
    this.content = content;
    this.parent = parent;
};
tnode.prototype.str=function () {
    return this.content;
};

module.exports={
    parse:function (html) {
        return node.parse(html);
    },
    create:function (tag,props) {
        return new node(tag,props);
    }
};