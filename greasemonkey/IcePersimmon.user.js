// ==UserScript==  
// @name IcePersimmon
// @namespace gm.weans.info
// @description VLC替代视频网站的Flash播放器
// @author Wean
// @mail weanwz@gmail.com
// @version 0.1.1
// @include http://v.youku.com/v_show/*
// @include http://bilibili.smgbb.cn/video/av*
// @include http://v.pps.tv/*
// @include http://v.163.com/movie/*
// @include http://vod.kankan.com/v/*
// @include http://www.yinyuetai.com/video/*
// @include http://tv.sohu.com/*
// @include http://v.sohu.com/*
// @include http://www.56.com/*
// ==/UserScript==  


//==================================================================//
//                                                                  
//                        使用方法
// Opera 安装方法:
//     1. 随便拷贝到一个文件夹下，好吧，最好拷贝到一个单独的文件夹。
//     2. Opera / 设置 / 首选项 / 高级 / 内容 / JavaScript 选项
//        / JavaScript 文件夹 / 选择， 选择刚才的那个文件夹。
//     3. Opera 最好允许插件加载，不过问题不大。
//
// Firefox 安装方法：
//     1. 火狐安装GreaseMonky 扩展
//     2. 把这个文件拖到火狐里去
//     3. 点击安装就可以了，最好配合FlashBlock使用
//
// Chrome 安装方法：
//     1. 扳手 / 工具 / 扩展程序
//     2. 把这个文件拖到浏览器里
//     3. 点击添加，安装完成
//
//==================================================================//

// 判断OS

// 是Windows系统
function isWindows(){
    return navigator.appVersion.indexOf("Win") != -1;
};

// 是X11系统
function isX11(){
    return navigator.appVersion.indexOf("X11") != -1;
};


// 判断浏览器

// 是Chrome浏览器
function isChrome(){
    return navigator.appVersion.indexOf("Chrome") != -1;
};

// 是Firefox浏览器
function isFirefox(){
    return navigator.appName.indexOf("Netscape") != -1;
};

// 格式化数字
function formatDigital(str){
    
};

// 获取关联度最大的视频
function getMostRelateVideo(title, videos){
    if (videos == null || videos.length == 0){
        return null;
    }
    return videos[0];
};

//===============================================================
//                      网站定义

var siteList = {};
function regSite(siteDetail){
    if (siteDetail.keys != null && siteDetail.keys.length > 0){
        for(var i=0; i<siteDetail.keys.length; i++){
            siteList[siteDetail.keys[i].replace('.', '_')] = siteDetail;
        }
    }
}

var siteYouku = {
    name: '优酷',
    keys: [
        'v.youku.com',
    ],
    getPlayer: function(){
        return {
            player: document.getElementById('player'),
        };
    },
    doRelateVideo: function(){
        var curTitle = null;
        var metas = document.head.getElementsByTagName('meta');
        if (metas != null){
            for (var i=0; i<metas.length; i++){
                if (metas[i]['name'] == 'description'){
                    curTitle = metas[i]['content'];
                    break;
                }
            }
        }
        if (curTitle == null){
            return;
        }
        var relateVideos = null;
        var relateVideoDiv = document.getElementById('vprelationvideo');
        if (relateVideoDiv == null){
            return;
        }
        var tmpDivs = relateVideoDiv.getElementsByTagName('div');
        if (tmpDivs == null){
            return;
        }
        for (var i=0; i<tmpDivs.length; i++){
            if (tmpDivs[i].className == 'items'){
                relateVideos = tmpDivs[i].getElementsByTagName('ul');
                break;
            }
        }
        if (relateVideos == null){
            return;
        }
        var videos = [];
        for (var i=0; i<relateVideos.length; i++){
            var v = relateVideo[i];
            var lis = v.getElementsByTagName('li');
            if (lis == null){
                continue;
            }
            for (var j=0; j<lis.length; j++){
                if (lis[j].className == 'v_link'){
                    var linkAs = lis[j].getElementsByTagName('a');
                    if (linkAs != null && linkAs.length > 0){
                        videos.push(linkAs[0]);
                    }
                    break;
                }
            }
        }
        var relateVideo = getMostRelateVideo(curTitle, videos);
        if (relateVideo != null){
            document.location.href = relateVideo.href;
        } 
    },
    handleEndReached : function(){
        // 专辑
        var pagerParam = '?__rt=1&__ro=listShow';
        var divList = document.getElementById('listShow');
        var ulLists = divList.getElementsByTagName('ul');
        var ulPage = null;
        var ulContent = null;
        for (var i=0; i<ulLists.length; i++){
            if (ulLists[i].className == 'pack_number'){
                ulContent = ulLists[i];
            } else if (ulLists[i].className == 'pages'){
                ulPage = ulLists[i];
            }
        }
        
        // 点播单
        if (ulContent == null){
            pagerParam = '';
            ulContent = document.getElementById('orderList');
        }
        
        if (ulContent != null){
            var nextLink = null;
            for (var i=0; i<ulContent.children.length; i++){
                if (ulContent.children[i].className == 'current' && (i+1) < ulContent.children.length){
                    var linkA = ulContent.children[i + 1].getElementsByTagName('a');
                    if (linkA != null && linkA.length > 0){
                        linkA = linkA[0];
                    } else{
                        linkA = null;
                    }
                    if (linkA != null){
                        nextLink = linkA.href;
                    }
                    break;
                }
            }
            
            if (nextLink == null && ulPage != null){
                // 下翻一页
                var pagerLink = null;
                for (var i=0; i<ulPage.children.length; i++){
                    if (ulPage.children[i].className == 'current' && (i+1) < ulPage.children.length){
                        var linkA = ulPage.children[i + 1].getElementsByTagName('a');
                        if (linkA != null && linkA.length > 0){
                            linkA = linkA[0];
                        } else {
                            linkA = null;
                        }
                        
                        if (linkA != null){
                            pagerLink = linkA.href + pagerParam;
                        }
                        break;
                    }
                }
                var xmlReq = new XMLHttpRequest();
                xmlReq.onreadystatechange = function(){
                    if (xmlReq.readyState == 4){
                        if (xmlReq.status == 200){
                            var parser = document.createElement('div');
                            parser.innerHTML = xmlReq.responseText;
                            var nextPageULs = parser.getElementsByTagName('ul');
                            var nextPageContent = null;
                            if (nextPageULs != null){
                                for (var i=0; i<nextPageULs.length; i++){
                                    if (nextPageULs[i].className == 'pack_number'){
                                        nextPageContent = nextPageULs[i];
                                        break;
                                    }
                                }
                            }
                            if (nextPageContent != null && nextPageContent.children != null && nextPageContent.children.length > 0){
                                var linkA = nextPageContent.children[i].getElementsByTagName('a');
                                if (linkA != null && linkA.length > 0){
                                    linkA = linkA[0];
                                } else {
                                    linkA = null;
                                }
                                if (linkA != null){
                                    document.location.href = linkA.href;
                                } else {
                                    doRelateVideo();
                                }
                            }
                        }
                    }
                };
                xmlReq.open('GET', pagerLink, true);
                xmlReq.send(null);
                return;
            }
            
            if (nextLink != null){
                document.location.href = nextLink;
            } else {
                doRelateVideo();
            }
        }
    },
};
regSite(siteYouku);

var siteBilibili = {
    name: 'BiliBili',
    keys: [
        'bilibili.smgbb.com',
    ],
    getPlayer: function(){
        var player = document.getElementById('bofqi');
        var embedPlayer = player.children[0];
        return {
            player : player,
            playerHeight : embedPlayer.height,
            playerWidth : embedPlayer.width,
        };
    },
};
regSite(siteBilibili);

var siteQiyi = {
    name: '奇异',
    keys: [
        'www.iqiyi.com',
    ],
    getPlayer : function(){
        // 奇异暂时不支持
        return {
            player : document.getElementById('flashbox'),
            playerHeight : "510",
            playerWidth : "900",
        }
    },
};
regSite(siteQiyi);

var sitePps = {
    name: 'PPS',
    keys: [
        'v.pps.tv',
    ],
    getPlayer : function(){
        var player = document.getElementById('p-players');
        var divs = player.getElementsByTagName('div');
        for (var i=0; i<divs.length; i++){
            if (divs[i].className == 'flash-player'){
                player = divs[i];
                break;
            }
        }
        return {
            player : player,
        };
    },
};
regSite(sitePps);

var site163 = {
    name: '网易',
    keys: [
        'v.163.com',
    ],
    getPlayer : function(){
        var player = document.getElementById('flashArea');
        return {
            player : player,
            playerHeight : player.clientHeight,
            playerWidth : player.clientWidth,
        };
    },
};
regSite(site163);

var siteKankan = {
    name: '迅雷看看',
    keys: [
        'vod.kankan.com',
    ],
    getPlayer : function(){
        return {
            player : document.getElementById('player_container'),
        };
    },
};
regSite(siteKankan);

var sitePptv = {
    name: 'PPTV',
    keys: [
        'v.pptv.com',
    ],
    getPlayer : function(){
        return {
            // pptv 暂不支持
            player : document.getElementById('pptv_playpage_box'),
        }
    },
};
regSite(sitePptv);

var siteYinyuetai = {
    name: '音悦台',
    keys: [
        'www.yinyuetai.com',
    ],
    getPlayer : function(){
        return {
            player : document.getElementById('player'),
        };
    },
};
regSite(siteYinyuetai);

var siteSohu = {
    name: '搜狐视频',
    keys: [
        'tv.sohu.com',
    ],
    getPlayer : function(){
        var player = document.getElementById('sohuplayer');
        var playerHeight = null;
        var playerWidth = null;
        if (player != null && player.parentNode != null){
            playerHeight = player.parentNode.clientHeight;
            playerWidth = player.parentNode.clientWidth;
        }
        return {
            player: player,
            playerHeight: playerHeight,
            playerWidth: playerWidth,
        };
    },
    handleFlvcdU : function(u){
        var sohuReg = new RegExp('^.*&new=');
        var sohuReplaceStr = 'http://newflv.sohu.ccgslb.net';
        return u.replace(sohuReg, sohuReplaceStr);
    }
};
regSite(siteSohu);

var site56 = {
    name: '56',
    keys: [
        'www.56.com',
    ],
    getPlayer: function(){
        var player = document.getElementById('VideoPlayObject');
        var playerHeight = null;
        var playerWidth = null;
        if (player != null){
            playerWidth = player.width;
            playerHeight = player.height;
        }
        return {
            player: player,
            playerHeight: playerHeight,
            playerWidth: playerWidth,
        };
    },
};
regSite(site56);

//
//===============================================================


// 获取网站代号
function getSiteCode(url){
    if (siteList == null){
        return null;
    }
    return siteList[url.host.replace('.', '_')];
};

if (isChrome() == false && isFirefox() == false){
    // 添加jquery支持
    var op_jq = document.createElement("script");
    op_jq.src = "http://code.jquery.com/jquery-1.7.1.js"; //jquery code source
    op_jq.type = "text/javascript";
    document.getElementsByTagName("head")[0].appendChild(op_jq);
}

function attachVlcEvent(p, event, callback){
    if (p == null || event == null || callback == null){
        return;
    }
    if (typeof p.addEventListener != 'undefined'){
        p.addEventListener(event, callback, false);
    }
    if (typeof p.attachEvent != 'undefined'){
        p.attachEvent(event, callback);
    }
    p['on' + event] = callback;
};

    // 获得跨域内容，通过yql
function getCrossDomain(url, callback, maxage) {

    if (isChrome() || isFirefox()){
        
        GM_xmlhttpRequest({
            method: 'GET',
            url: url,
            onload: function(r){
                if (typeof (callback) === 'function'){
                    callback(r.responseText);
                }
            }
        });
            
        return;
    }

    if (typeof (url) !== 'undefined') {
        var yql = 'http://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent('select * from html where url="' + url + '"') + '&diagnostics=false&format=xml&callback=?&_maxage=';
        if (typeof (maxage) === 'undefined') {
            yql += '10000'; // Value is in ms
        }
        $.getJSON(yql, function (data) {
            if (typeof (callback) === 'function') {
                callback(data.results[0]);
            }
        }).fail(function (jqXHR, textStatus, errorThrown) {
            // Some code here to handle a failed request
        });
    }
};

function IcePersimmonMain(e){

    // 查找到播放器
    var playInf = {};

    var siteInf = getSiteCode(document.location);
    player = siteInf.getPlayer();
    
    // 没有找到，退出
    if (player == null || player.player == null){
        return;
    }

    // 删掉播放器
    player.player.innerHTML = '';

    // 用vlc替代
    var vlc = document.createElement('embed');
    vlc.type = 'application/x-vlc-plugin';
    vlc.name = 'vlcflash';
    vlc.name = 'vlcflash';
    vlc.setAttribute('autoplay', 'true');
    vlc.setAttribute('loop', 'no');
    //vlc.setAttribute('toolbar', 'no');
    vlc.height = player.playerHeight == null ? "100%" : player.playerHeight;
    vlc.width = player.playerWidth == null ? '100%' : player.playerWidth;
    player.player.appendChild(vlc);

    navigator.plugins.refresh(false);

    // 是否刷新过（linux 全屏一下子）
    var refreshed = false;
    var playIndex = 0;

    // 等待jQuery和vlc加载完
    function op_wait()
    {
        if (isChrome() == false && isFirefox() == false){
            if(typeof window.jQuery == "undefined"){
                window.setTimeout(op_wait,300); 
                return;
            }
        }

        if (isFirefox() == true){
            if (vlc.wrappedJSObject != null){
                vlc = vlc.wrappedJSObject;
            }
        }

        if (typeof vlc.playlist == "undefined"){
            window.setTimeout(op_wait,300); 
            return;
        }
         
        if (isChrome() == false && isFirefox() == false){
            $ = window.jQuery; 
        }
        appJQuery();
    }
    op_wait();

    // 播放到结尾时
    function playerEndReached(e){
        if (vlc && vlc.playlist){
            if (isX11()){
                // Linux下需要处理才能自动跳到下面一段
                playIndex++;
                if (playIndex < playInf.Items.length){
                    vlc.playlist.next();
                } else {
                    // 连播
                    if (siteInf != null && siteInf.handleEndReached != null){
                        siteInf.handleEndReached();
                    }
                }
            }
            return;
        }
    };

    // 开始播放时
    function playerPlaying(){
        if (vlc && vlc.playlist && !refreshed){
            if (isX11()){
                // Linux 下，需要在播放时全屏一下子，才能显示出视频
                vlc.video.toggleFullscreen();
                vlc.video.toggleFullscreen();
            }
            refreshed = true;
            return;
        }
    };
    
    // 主处理
    function appJQuery()
    {
        getCrossDomain("http://www.flvcd.com/parse.php?flag=&format=&kw=" + encodeURIComponent(document.location) +  "&sbt=%BF%AA%CA%BCGO%21", function(html){

            // vlc 事件处理
            attachVlcEvent(vlc, 'MediaPlayerEndReached', playerEndReached);
            attachVlcEvent(vlc, 'MediaPlayerPlaying', playerPlaying);

            var parse = document.createElement('div');
            parse.innerHTML = html;

            var forms = parse.getElementsByTagName('form');
            if (forms != null){
                var playInfValue = null;
                for (var i=0; i<forms.length; i++){
                    if (forms[i].getAttribute('name') == 'mform'){
                        // 又找到了 ^_^

                        var mform = forms[i];
                        var inputs = mform.getElementsByTagName('input');
                        if (inputs == null){
                            break;
                        }
                        for (var j=0; j<inputs.length; j++){
                            if (inputs[j].getAttribute('name') == 'inf'){
                                
                                playInfValue = inputs[j].value;
                                
                                break;
                            }
                        }

                        break;
                    }
                }

                if (playInfValue != null){

                    var listInfo = playInfValue.split('<');
                    if (listInfo == null){
                        return;
                    }

                    var r = new RegExp('(.*)>(.*)');
                    
                    for (var i=0; i< listInfo.length; i++){
                        var m = listInfo[i].replace(/(^\s*)|(\s*$)/g, "").match(r);
                    
                        if (m != null && m.length == 3){
                            if (typeof playInf.Items == 'undefined'){
                                if (m[1] == 'N'){
                                    playInf.Items = [];
                                    playInf.Items.push({N: m[2]});
                                } else {
                                    if (m[2] != ''){
                                        playInf[m[1]] = m[2];
                                    }
                                }
                            } else {
                                if (m[1] == 'N'){
                                    playInf.Items.push({N: m[2]});
                                } else {
                                    if (m[2] != ''){
                                        playInf.Items[playInf.Items.length - 1][m[1]] = m[2];
                                    }
                                }
                            }
                        }
                    }
                }
            }

            if (playInf != null && playInf.Items != null){

                // 添加到vlc播放列表
                for (var i=0; i<playInf.Items.length; i++){
                    if (siteInf != null && siteInf.handleFlvcdU != null){
                        playInf.Items[i].U = siteInf.handleFlvcdU(playInf.Items[i].U);
                    }
                    vlc.playlist.add(playInf.Items[i].U);
                }
                vlc.playlist.playItem(0);
                playIndex = 0;
            }

        }, null);
    }
};

IcePersimmonMain();
//window.addEventListener('load', IcePersimmonMain, false);
