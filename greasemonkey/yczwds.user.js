// ==UserScript==  
// @name ccc  
// @namespace sny.ccc  
// @include http://*yczwds.com/*
// ==/UserScript==  
window.addEventListener('load', funcionPrincipal, false);//ҳ��������Ϻ�ص�

function funcionPrincipal() {
    window.setTimeout(funcClick, 3000);
}

function funcClick(){
    __doPostBack('btLevel', '');
}
