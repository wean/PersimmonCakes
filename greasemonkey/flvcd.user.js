// ==UserScript==  
// @name flvcd  
// @namespace gm.weans.info  
// @include http://v.youku.com/v_show/*
// @include http://bilibili.smgbb.cn/video/av*
// @include http://v.pps.tv/*
// @include http://v.163.com/movie/*
// ==/UserScript==  

// 添加jquery支持
var op_jq = document.createElement("script");
op_jq.src = "http://code.jquery.com/jquery-1.7.1.js"; //jquery code source
op_jq.type = "text/javascript";
document.getElementsByTagName("head")[0].appendChild(op_jq);

window.addEventListener('load',function (e){

    // 查找到播放器
    var player = null;
    var playerHeight = "100%";
    var playerWidth = "100%";
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

    // 是Windows系统
    function isWindows(){
        return navigator.appVersion.indexOf("Win") != -1;
    };

    // 是X11系统
    function isX11(){
        return navigator.appVersion.indexOf("X11") != -1;
    };

    // 获得跨域内容，通过yql
    var getCrossDomain = function (url, callback, maxage) {
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
        if(typeof window.jQuery == "undefined" || typeof vlc.playlist == "undefined") { window.setTimeout(op_wait,100); }
        else { $ = window.jQuery; appJQuery(); }
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
            vlc.addEventListener('MediaPlayerEndReached', playerEndReached, false);
            vlc.addEventListener('MediaPlayerPlaying', playerPlaying, false);
            vlc.attachEvent('MediaPlayerEndReached', playerEndReached);
            vlc.attachEvent('MediaPlayerPlaying', playerPlaying);

            $(html).find('td').each(function(){
                var al = $(this);
                if (al.length > 0 && al[0].className == 'mn STYLE4'){
                    if (al[0].innerHTML.indexOf("下载地址") >= 0){

                        // 找到下载地址啦 ^ - ^

                        var downList = $(al[0].innerHTML).find('a');
                        var linkList = [];
                        for (var i=0; i<downList.length; i++){
                            linkList.push(downList[i].href);
                        }

                        // 添加到vlc播放列表
                        for (var i=0; i<linkList.length; i++){
                            vlc.playlist.add(linkList[i]);
                        }
                        vlc.playlist.playItem(0);

                        return false;
                    }
                }
            });

        }, null);
    }
},false);
