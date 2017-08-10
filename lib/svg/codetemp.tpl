/**
 * @packet ##NAME##;
 */
if(!window.document.getElementById("mt-icon-default-style")){
    var _a = document.createElement("style");
    _a.setAttribute("media", "screen");
    _a.setAttribute("type", "text/css");
    _a.setAttribute("id", "mt-icon-default-style");
    _a.appendChild(document.createTextNode(".mt-icon{display:inline-block;width:.8em;height:.8em;stroke-width:0;stroke:currentColor;fill:currentColor;vertical-align:middle}.mt-icon-spin{display:inline-block;-webkit-animation:icon-spin 2s infinite linear;animation:icon-spin 2s infinite linear}@-webkit-keyframes icon-spin{0%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}100%{-webkit-transform:rotate(359deg);transform:rotate(359deg)}}@keyframes icon-spin{0%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}100%{-webkit-transform:rotate(359deg);transform:rotate(359deg)}}"));
    document.getElementsByTagName("head")[0].appendChild(_a);
}
if(window.document.querySelectorAll("[packet='icon.##NAME##']").length===0){
    var _a=window.document.createElement("div");
    _a.innerHTML=##SVGCONTENT##;
    window.document.body.appendChild(_a.childNodes[0]);
}