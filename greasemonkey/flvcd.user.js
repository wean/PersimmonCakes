// ==UserScript==  
// @name flvcd  
// @namespace gm.weans.info  
// @include http://v.youku.com/v_show/*
// @include http://bilibili.smgbb.cn/video/av*
// @include http://v.pps.tv/*
// @include http://v.163.com/movie/*
// @include http://vod.kankan.com/v/*
// @include http://www.yinyuetai.com/video/*
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

function isFirefox(){
    return navigator.appName.indexOf("Netscape") != -1;
};

if (isChrome() == false && isFirefox() == false){
    // 添加jquery支持
    var op_jq = document.createElement("script");
    op_jq.src = "http://code.jquery.com/jquery-1.7.1.js"; //jquery code source
    op_jq.type = "text/javascript";
    document.getElementsByTagName("head")[0].appendChild(op_jq);
}

window.addEventListener('load',function (e){

    // 查找到播放器
    var player = null;
    var playerHeight = "100%";
    var playerWidth = "100%";
    
    var playInf = {};

    if (document.location.host == 'v.youku.com'){
        player = document.getElementById('player');
    } else if (document.location.host == 'bilibili.smgbb.cn'){
        player = document.getElementById('bofqi');
        var embedPlayer = player.children[0];
        playerHeight = embedPlayer.height;
        playerWidth = embedPlayer.width;
    } else if (document.location.host == 'www.iqiyi.com'){
        // 奇异暂时不支持
        player = document.getElementById('flashbox');
        playerHeight = "510";
        playerWidth = "900";
    } else if (document.location.host == 'v.pps.tv'){
        player = document.getElementById('p-players');
        var divs = player.getElementsByTagName('div');
        for (var i=0; i<divs.length; i++){
            if (divs[i].className == 'flash-player'){
                player = divs[i];
                break;
            }
        }
    } else if (document.location.host == 'v.163.com'){
        player = document.getElementById('flashArea');
        playerHeight = player.clientHeight;
        playerWidth = player.clientWidth;
    } else if (document.location.host == 'vod.kankan.com'){
        player = document.getElementById('player_container');
    } else if (document.location.host == 'v.pptv.com'){
        // pptv 暂不支持
        player = document.getElementById('pptv_playpage_box');
    } else if (document.location.host == 'www.yinyuetai.com'){
        player = document.getElementById('player');
    }

    // 没有找到，退出
    if (player == null){
        return;
    }

    // 删掉播放器
    player.innerHTML = '';

    // 用vlc替代
    var vlc = document.createElement('embed');
    vlc.type = 'application/x-vlc-plugin';
    vlc.name = 'vlcflash';
    vlc.name = 'vlcflash';
    vlc.setAttribute('autoplay', 'true');
    vlc.setAttribute('loop', 'no');
    //vlc.setAttribute('toolbar', 'no');
    vlc.height = playerHeight;
    vlc.width = playerWidth;
    player.appendChild(vlc);

    // 是否刷新过（linux 全屏一下子）
    var refreshed = false;

    // 获得跨域内容，通过yql
    var getCrossDomain = function (url, callback, maxage) {

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

    // 等待jQuery和vlc加载完
    function op_wait()
    {
        if (isChrome() == false && isFirefox() == false){
            if(typeof window.jQuery == "undefined"){
                window.setTimeout(op_wait,100); 
                return;
            }
        }

        if (typeof vlc.playlist == "undefined"){
            window.setTimeout(op_wait,100); 
            return;
        }
         
        if (isChrome() == false && isFirefox() == false){
            $ = window.jQuery; 
        }
        appJQuery();
    }
    op_wait();

    // 播放到结尾时
    function playerEndReached(){
        if (vlc && vlc.playlist){
            if (isX11()){
                // Linux下需要处理才能自动跳到下面一段
                vlc.playlist.next();
            }
            var playItems = vlc.playlist.items;
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
            if (typeof vlc.addEventListener != 'undefined'){
                vlc.addEventListener('MediaPlayerEndReached', playerEndReached, false);
                vlc.addEventListener('MediaPlayerPlaying', playerPlaying, false);
            }
            if (typeof vlc.attachEvent != 'undefined'){
                vlc.attachEvent('MediaPlayerEndReached', playerEndReached);
                vlc.attachEvent('MediaPlayerPlaying', playerPlaying);
            }

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
                    vlc.playlist.add(playInf.Items[i].U);
                }
                vlc.playlist.playItem(0);
            }

        }, null);
    }
},false);
