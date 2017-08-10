/**
 * @packet ##NAME##;
 */
if(!window.document.getElementById("t-icon-default-style")){
    var _a = document.createElement("style");
    _a.setAttribute("media", "screen");
    _a.setAttribute("type", "text/css");
    _a.setAttribute("id", "t-icon-default-style");
    _a.appendChild(document.createTextNode(".t-icon{display:inline-block;width:1em;height:1em;stroke-width:0;stroke:currentColor;fill:currentColor;vertical-align:middle}.t-icon-spin{display:inline-block;-webkit-animation:t-icon-spin 2s infinite linear;animation:t-icon-spin 2s infinite linear}@-webkit-keyframes t-icon-spin{0%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}100%{-webkit-transform:rotate(359deg);transform:rotate(359deg)}}@keyframes t-icon-spin{0%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}100%{-webkit-transform:rotate(359deg);transform:rotate(359deg)}}"));
    document.getElementsByTagName("head")[0].appendChild(_a);
}
if(window.document.querySelectorAll("[packet='icon.##NAME##']").length===0){
    var con=window.document.getElementsByClassName("t-icon-svgs"),_a=window.document.createElement("div");
    if(con.length===0){
        con=window.document.createElement("div");
        con.setAttribute("class","t-icon-svgs");
        window.document.body.appendChild(con);
    }
    _a.innerHTML=##SVGCONTENT##;
    con.appendChild(_a.childNodes[0]);
}