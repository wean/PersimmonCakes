// ==UserScript==  
// @name ccc  
// @namespace sny.ccc  
// @include http://*yczwds.com/*
// ==/UserScript==  
window.addEventListener('load', funcionPrincipal, false);//页面载入完毕后回调

function funcionPrincipal() {
    window.setTimeout(funcClick, 3000);
}

function funcClick(){
    __doPostBack('btLevel', '');
}
