module.exports=function (content,option,fn) {
    var bile=this;
    try{
        fn(JSON.stringify(JSON.parse(content)));
    }catch(e){
        bile.setMakeErrorMessage(e.stack);
        fn(content);
    }
};