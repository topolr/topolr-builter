var config = require("./config/congfig");
var topolr = require("topolr-util");
var Path = require("path");
var fs = require("fs");
var builder = require("./lib/builder");
var util = require("./lib/util");

var waiter = {
    _data: {},
    _tid: null,
    _time: 500,
    _fn: null,
    _times: 0,
    add: function (type, path) {
        if (!waiter._data[type]) {
            waiter._data[type] = [];
        }
        if (waiter._data[type].indexOf(path) === -1) {
            waiter._data[type].push(path);
        }
        if (waiter.tid !== null) {
            clearTimeout(waiter.tid);
        }
        setTimeout(function () {
            var _has = false;
            for (var i in waiter._data) {
                _has = true;
            }
            if (_has) {
                waiter._fn && waiter._fn(waiter._data, waiter._times);
                waiter._times++;
            }
            waiter._data = {};
            waiter._tid = null;
        }, waiter._time);
        return this;
    },
    setHandler: function (fn) {
        waiter._fn = fn;
        return this;
    }
};

var socketer = {
    client: {},
    cache: null,
    handler: {},
    init: function (port, fn) {
        var io = require('socket.io').listen(port);
        io.sockets.on('connection', function (socket) {
            var id = topolr.util.uuid();
            socketer.client[id] = socket;
            io.sockets.emit('uuid', id);
            socket.on('message', function (info) {
                var uuid = info.uuid, type = info.type, msg = info.msg;
                if (socketer.handler[type]) {
                    socketer[type](msg, function (ifo) {
                        if (socketer.client[uuid]) {
                            socketer.client[uuid].emit("message", ifo);
                        }
                    });
                }
            });
            socket.on('disconnect', function () {
                delete socketer.client[id];
            });
            fn && fn.call(socketer);
        });
    },
    send: function (type, msg) {
        for (var i in socketer.client) {
            socketer.client[i].emit("message", {
                type: type,
                data: msg
            });
        }
    },
    bind: function (type, fn) {
        socketer.handler[type] = fn;
        return socketer;
    },
    unbind: function (type) {
        delete socketer.handler[type];
        return this;
    }
};
module.exports = {
    scan: function (option) {
        topolr.extend(true, option, option.develop);
        option.debug = false;
        builder(option).build(["doMake", "doPage"]).done(function () {
            util.logger.log("step", "dodone");
        });
    },
    publish: function (option) {
        topolr.extend(true, option, option.publish);
        option.debug = false;
        var _builter = builder(option);
        util.logger.log("binfo", _builter.getBasicInfo());
        _builter.build(["doMake", "doOutput", "doMerge", "doPage", "doLog"]).done(function () {
            util.logger.log("step", "dodone");
        });
    },
    build_dev: function (option) {
        topolr.extend(true, option, option.develop);
        option.debug = true;
        var _builter = builder(option);
        util.logger.log("binfo", _builter.getBasicInfo());
        _builter.build(["doMake", "doOutput", "doMerge", "doPage", "doLog"]).done(function () {
            util.logger.log("step", "dodone");
        });
    },
    build_pub_all: function (option) {
        topolr.extend(true, option, option.publish);
        option.debug = false;
        var _builter = builder(option);
        util.logger.log("binfo", _builter.getBasicInfo());
        _builter.build(["doMake", "allinone"]).done(function () {
            util.logger.log("step", "dodone");
        });
    },
    build_dev_all: function (option) {
        topolr.extend(true, option, option.develop);
        option.debug = true;
        var _builter = builder(option);
        util.logger.log("binfo", _builter.getBasicInfo());
        _builter.build(["doMake", "allinone"]).done(function () {
            util.logger.log("step", "dodone");
        });
    },
    develop: function (option) {
        topolr.extend(true, option, option.develop);
        option.debug = true;
        var _builder = builder(option);
        var doit = function (first) {
            if (first) {
                util.logger.log("binfo", _builder.getBasicInfo());
            }
            util.logger.log("line", first);
            _builder.build(["doMake", "doOutput", "doMerge", "doPage", "dodevlog"]).done(function (a) {
                util.logger.log("step", "dodone");
                socketer.cache = a;
                if (first) {
                    socketer.init(_builder.getDevport(), function () {
                        this.send("init", {
                            devId: _builder.getId(),
                            info: this.cache,
                            option: option
                        });
                    });
                    util.logger.log("socket", _builder.getDevport());
                } else {
                    socketer.send("build", {
                        devId: _builder.getId(),
                        info: a
                    });
                }
            });
        };
        require('chokidar').watch(_builder.getBasePath(), {ignored: /[\/\\]\./}).on('change', function (path) {
            waiter.add("edit", path);
        }).on('add', function (path) {
            waiter.add("add", path);
        }).on('unlink', function (path) {
            waiter.add("remove", path);
        }).on("ready", function () {
            waiter.setHandler(function (a, times) {
                _builder.getSourceContainer().changeFiles(a);
                doit(times === 0);
            });
        }).on("error", function () {
        });
        process.on('SIGINT', function () {
            process.exit();
        });
    },
    override: function (name,option) {
        if (name) {
            var codepath=option.basePath;
            var basepath = require("path").resolve(process.cwd(), "./node_modules/" + name);
            if (topolr.file(basepath).isExists()) {
                var map = require(basepath + "/package.json");
                if (map.topolr) {
                    var sourcePath = require("path").resolve(basepath, map.topolr.basePath)+"/";
                    var queue=topolr.queue();
                    topolr.file(sourcePath).scan(function (path,isfile) {
                        if(isfile){
                            queue.add(function (a,info) {
                                if(!topolr.file(info.newpath).isExists()) {
                                    topolr.file(info.original).copyTo(info.newpath).then(function () {
                                        queue.next();
                                    });
                                }
                            },function () {
                                this.next();
                            },{
                                original:path,
                                newpath:codepath+"/"+path.substring(sourcePath.length)
                            });
                        }
                    });
                    queue.complete(function () {
                        util.logger.log("info","copy files done");
                    });
                    queue.run();
                }else{
                    util.logger.log("info","module is not a topolr module");
                }
            }else{
                util.logger.log("info","module is not exist,install it first");
            }
        }
    }
};