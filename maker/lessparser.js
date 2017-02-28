var less=require("less");
module.exports=function (content,option,fn) {
    var bile=this;
    try{
        less.render(content, function (e, output) {
        	if(!e){
	            fn(output.css);
	        }else{
	        	bile.setMakeErrorMessage(e.stack);
	        	fn(content);
	        }
        });
    }catch(e){
        bile.setMakeErrorMessage(e.stack);
        fn(content);
    }
}