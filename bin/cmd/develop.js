var main=require("./../../main");
module.exports= {
    command: "develop",
    desc: "code and debug the project",
    paras: [],
    fn: function (parameters, cellmapping, allmapping) {
        main.develop(allmapping);
    }
};