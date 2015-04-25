$(function(){
    var $hitchui=$("#chui");  //用来敲击的锤子
    var $treasure=$("#treasure"); //整个矿，包含矿口
    var $gold=$("#gold");  //矿
    var hitAllTimes=1; //敲击总次数(从第0次开始)
    hitTimes=0;  //全局变量，第几次敲击，初始为0
    var cursorChuiUrl="http://gtms01.alicdn.com/tps/i1/TB1nPp9HXXXXXbqXFXXKdQq.VXX-128-0.ico";
    var transparentUrl="http://gtms04.alicdn.com/tps/i4/TB1fvGfHXXXXXaZXXXXjznUFXXX-16-16.ico";
    var wenSmallUrl="http://gtms04.alicdn.com/tps/i4/TB1DUd7HXXXXXa7XVXX_ZLfJXXX-83-63.png";
    var wenLargeUrl="http://gtms04.alicdn.com/tps/i4/TB1DUd7HXXXXXa7XVXX_ZLfJXXX-83-63.png";
    var status="";  //当前状态，初始为正常状态
    createWen(hitAllTimes+1);   //创建hitAllTimes+1条裂纹


     $('#wrap').fullpage({
        scrollBar: true,
        navigation: true,
        navigationColor: "#fff"
    });

    //请求中奖名单
    $.ajax({
        url: URL_CONFIG.winnerList,
        dataType:"jsonp",
        jsonp:"jsoncallback",
        success:function(data){
            var list="";
            var $ul=$('#winnerList');
            $.each(data,function(index){
                list+="<li>"+data[index].name+"中了"+convertPrize(data[index].prize)+"红包</li>";
            });
            $ul.html(list);
             //中奖名单轮播
            var width=240;  //每个中奖名单长度是240px
            if($ul.children().length>4){
                setInterval(function(){
                    if(parseFloat($ul.css("left"))<($ul.children().length-5)*(-width)){
                        $ul.css("left",width+"px");
                    }
                    $ul.animate({
                        left: '-='+width+"px"
                    },700, function() {
                    });
                }, 3000);
            }
        }
    });

    //把后台返回的中奖名单矿产转换为金额
    function convertPrize(source){
        switch($.trim(source)){
            case "prize01":
                return "2800￥";
            case "prize02":
                return "100￥";
            case "prize03":
                return "50￥";
            case "prize04":
                return "10￥";
            default:
                break;
        }
    }

    //在矿上移动时，鼠标样式变为锤子
    $gold.bind("mouseover",useChui=function(e) {
        $(this).css("cursor","url("+cursorChuiUrl+"),auto");
    });

    //砸金矿动画
    $gold.bind("mousedown",function(e) {
        $(this).unbind('mouseover', useChui).css("cursor","url("+transparentUrl+"),auto"); //防止同时出现两个锤子
        setTimeout(function(){   //防止双击时直接出现了宝箱，因为必须要点两次
            hitTimes++;
        }, 1500);

        $hitchui.css({"left":e.pageX,"top":e.pageY}).show().css("transform","rotate(10deg)");  //蓄力，锤子向上旋转
        setTimeout(function(){
            $hitchui.css("transform","rotate(-20deg)");  //0.2s后，锤子旋转到最底部
            setTimeout(function(){
                $hitchui.css("transform","rotate(0)"); //0.4s后，锤子回到正常位置
                $gold.addClass('shake shake-hard shake-constant');  //金矿抖动
                $(".wen").addClass('shake shake-hard shake-constant');
                if(hitTimes<hitAllTimes){
                    setTimeout(function(){
                        $(".wen").eq(hitTimes).css("background","url("+wenSmallUrl+")").css({"left":e.pageX-40,"top":e.pageY+65}).css({"height":"63px","width":"83px"});  //显示第hitTimes条裂纹
                    }, 300);

                    //重新获取当前状态，保证同步后继续点击时不需要重新刷新页面
                    $.ajax({
                        url:URL_CONFIG.getStatus,
                        dataType:"jsonp",
                        jsonp:"jsoncallback",
                        success:function(data){
                            switch(data){
                                case "AvailableState":
                                    status="";
                                break;
                                case "UnLoginState": //未登录
                                    status="";
                                    break;
                                case "UnableState": //活动未开始
                                    status="notStart";
                                    break;
                                default:  //没有抽奖资格
                                    status="noQualification";
                                    break;
                            }

                            //************   测试   ***************
                            //status="";
                            //*************************************

                            if(status=="notStart"){
                                $('.bg').fadeIn(200);
                                $("#loadInfo").children('.thead').text("活动还未开始");
                                $("#loadInfo").children('.tcontent').text("亲，活动还未开始，再等等哈");
                                setTimeout(function(){
                                    $("#loadInfo").fadeIn(200);
                                }, 600);
                            }
                            else if(status=="noQualification"){
                                $('.bg').fadeIn(200);
                                $("#prizeResult").children('.thead').text("还没有抽奖机会哦");
                                $("#prizeResult").children('.tcontent').text("亲，赶紧同步吧");
                                setTimeout(function(){
                                    $("#prizeResult").fadeIn(200);
                                }, 600);
                            }
                        }
                    });


                    setTimeout(function(){
                        $gold.removeClass('shake shake-hard shake-constant').css("cursor","url("+cursorChuiUrl+"),auto").bind("mouseover",useChui);  //0.9s后，取消金矿抖动，并让鼠标恢复锤子样式
                        $(".wen").removeClass('shake shake-hard shake-constant');
                        $hitchui.hide();
                    }, 500);
                }
                else{
                    setTimeout(function(){ //显示最后一条裂纹
                        $(".wen").eq(hitTimes).css({"background":"url("+wenLargeUrl+"),no-repeat","background-size":"100%"}).css({"left":e.pageX-72,"top":e.pageY+65}).css({"height":"98px","width":"133px"});
                    }, 300);
                    timerBoxOut=setTimeout(function(){ //0.9s后，取消金矿抖动，并让鼠标恢复锤子样式
                        $gold.removeClass('shake shake-hard shake-constant').css("cursor","url("+cursorChuiUrl+"),auto").bind("mouseover",useChui);
                        $(".wen").removeClass('shake shake-hard shake-constant');
                        $hitchui.hide();
                        if(hitTimes==hitAllTimes||hitTimes==hitAllTimes+1){
                            setTimeout(function(){
                                boxOut();  //显示宝箱
                            }, 1000);
                        }
                    }, 500);
                }
            }, 200);
        }, 200);
    });

    //金矿消失，出现宝箱
    function boxOut(){
        $("#gold").fadeOut(600);
        $("#chui").hide();
        removeAllWen();
        clearTimeout(timerBoxOut);
        $("#box").fadeIn(2000).addClass('animated bounceIn');
        setTimeout(function(){
            $('.bg').fadeIn(200);
            $('#openBoxButton').fadeIn(400);
        }, 500);
    }

    //打开宝箱
    $("#openBoxButton").click(function(event) {
        // hitTimesAmount++;
        // JSTracker.log('该页面总抽奖次数'+hitTimesAmount);
        $(".bg").css({"opacity":".6","background-color":"#000"});
        $(this).hide();
        $.ajax({
            url: URL_CONFIG.getLottery,
            dataType: 'jsonp',
            jsonp: "jsoncallback",
            success:function(data){
                if(data.award=="0"){   //对象名不能是纯数字，要转换成字符串
                    data.award="prize00";
                }

                //*************  测试  *******************
                     //data.award="prize03";
                //****************************************

                //随机使用该矿奖的中奖信息
                var randomNum = Math.floor(Math.random()*prizeResultNotes[data.award].length);
                $('#prizeResult').children('.thead').text(prizeResultNotes[data.award][randomNum].head);
                $('#prizeResult').children('.tcontent').text(prizeResultNotes[data.award][randomNum].notes);

                $('#prizeResult').fadeIn(400).addClass('animated bounceIn');
            }
        });
    });

    //点击同步按钮
    $(".sync").parent("button").click(function(event) {
        window.location.href=URL_CONFIG.syncUrl;
    });

    //活动未开始时点击“好的”按钮
    $(".okexit").parent("button").click(function(event) {
        goAgain();
    });

    //点击x ，关闭窗口重来
    $(".closeWindow").click(function(event) {
        goAgain();
    });

    //点击背景，退出当前小窗口
    $('.bg').click(function(){
        goAgain();
    });

    function goAgain(){
        $('.twindow').hide();
        $("#openBoxButton").hide();
        $(".bg").css({"opacity":"1","background-color":""});
        $('.bg').fadeOut(200);
        $("#box").hide();
        $("#gold").show();
        hitTimes=0;  //重置点击次数
        removeAllWen();
        createWen(hitAllTimes+1);
    }

    function createWen(num){   //创建裂纹
        for(var i=0;i<num;i++){
            $('<div class="wen"></div>').appendTo('body');
        }
    }

    function removeAllWen(){  //移除所有裂纹
        $(".wen").remove();
    }

});

/*! jQuery UI - v1.9.2 - 2014-03-21
* http://jqueryui.com
* Includes: jquery.ui.effect.js
* Copyright 2014 jQuery Foundation and other contributors; Licensed MIT */

jQuery.effects||function(e,t){var i=e.uiBackCompat!==!1,a="ui-effects-";e.effects={effect:{}},function(t,i){function a(e,t,i){var a=c[t.type]||{};return null==e?i||!t.def?null:t.def:(e=a.floor?~~e:parseFloat(e),isNaN(e)?t.def:a.mod?(e+a.mod)%a.mod:0>e?0:e>a.max?a.max:e)}function s(e){var a=u(),s=a._rgba=[];return e=e.toLowerCase(),m(l,function(t,n){var r,o=n.re.exec(e),h=o&&n.parse(o),l=n.space||"rgba";return h?(r=a[l](h),a[d[l].cache]=r[d[l].cache],s=a._rgba=r._rgba,!1):i}),s.length?("0,0,0,0"===s.join()&&t.extend(s,r.transparent),a):r[e]}function n(e,t,i){return i=(i+1)%1,1>6*i?e+6*(t-e)*i:1>2*i?t:2>3*i?e+6*(t-e)*(2/3-i):e}var r,o="backgroundColor borderBottomColor borderLeftColor borderRightColor borderTopColor color columnRuleColor outlineColor textDecorationColor textEmphasisColor".split(" "),h=/^([\-+])=\s*(\d+\.?\d*)/,l=[{re:/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/,parse:function(e){return[e[1],e[2],e[3],e[4]]}},{re:/rgba?\(\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/,parse:function(e){return[2.55*e[1],2.55*e[2],2.55*e[3],e[4]]}},{re:/#([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})/,parse:function(e){return[parseInt(e[1],16),parseInt(e[2],16),parseInt(e[3],16)]}},{re:/#([a-f0-9])([a-f0-9])([a-f0-9])/,parse:function(e){return[parseInt(e[1]+e[1],16),parseInt(e[2]+e[2],16),parseInt(e[3]+e[3],16)]}},{re:/hsla?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/,space:"hsla",parse:function(e){return[e[1],e[2]/100,e[3]/100,e[4]]}}],u=t.Color=function(e,i,a,s){return new t.Color.fn.parse(e,i,a,s)},d={rgba:{props:{red:{idx:0,type:"byte"},green:{idx:1,type:"byte"},blue:{idx:2,type:"byte"}}},hsla:{props:{hue:{idx:0,type:"degrees"},saturation:{idx:1,type:"percent"},lightness:{idx:2,type:"percent"}}}},c={"byte":{floor:!0,max:255},percent:{max:1},degrees:{mod:360,floor:!0}},p=u.support={},f=t("<p>")[0],m=t.each;f.style.cssText="background-color:rgba(1,1,1,.5)",p.rgba=f.style.backgroundColor.indexOf("rgba")>-1,m(d,function(e,t){t.cache="_"+e,t.props.alpha={idx:3,type:"percent",def:1}}),u.fn=t.extend(u.prototype,{parse:function(n,o,h,l){if(n===i)return this._rgba=[null,null,null,null],this;(n.jquery||n.nodeType)&&(n=t(n).css(o),o=i);var c=this,p=t.type(n),f=this._rgba=[];return o!==i&&(n=[n,o,h,l],p="array"),"string"===p?this.parse(s(n)||r._default):"array"===p?(m(d.rgba.props,function(e,t){f[t.idx]=a(n[t.idx],t)}),this):"object"===p?(n instanceof u?m(d,function(e,t){n[t.cache]&&(c[t.cache]=n[t.cache].slice())}):m(d,function(t,i){var s=i.cache;m(i.props,function(e,t){if(!c[s]&&i.to){if("alpha"===e||null==n[e])return;c[s]=i.to(c._rgba)}c[s][t.idx]=a(n[e],t,!0)}),c[s]&&0>e.inArray(null,c[s].slice(0,3))&&(c[s][3]=1,i.from&&(c._rgba=i.from(c[s])))}),this):i},is:function(e){var t=u(e),a=!0,s=this;return m(d,function(e,n){var r,o=t[n.cache];return o&&(r=s[n.cache]||n.to&&n.to(s._rgba)||[],m(n.props,function(e,t){return null!=o[t.idx]?a=o[t.idx]===r[t.idx]:i})),a}),a},_space:function(){var e=[],t=this;return m(d,function(i,a){t[a.cache]&&e.push(i)}),e.pop()},transition:function(e,t){var i=u(e),s=i._space(),n=d[s],r=0===this.alpha()?u("transparent"):this,o=r[n.cache]||n.to(r._rgba),h=o.slice();return i=i[n.cache],m(n.props,function(e,s){var n=s.idx,r=o[n],l=i[n],u=c[s.type]||{};null!==l&&(null===r?h[n]=l:(u.mod&&(l-r>u.mod/2?r+=u.mod:r-l>u.mod/2&&(r-=u.mod)),h[n]=a((l-r)*t+r,s)))}),this[s](h)},blend:function(e){if(1===this._rgba[3])return this;var i=this._rgba.slice(),a=i.pop(),s=u(e)._rgba;return u(t.map(i,function(e,t){return(1-a)*s[t]+a*e}))},toRgbaString:function(){var e="rgba(",i=t.map(this._rgba,function(e,t){return null==e?t>2?1:0:e});return 1===i[3]&&(i.pop(),e="rgb("),e+i.join()+")"},toHslaString:function(){var e="hsla(",i=t.map(this.hsla(),function(e,t){return null==e&&(e=t>2?1:0),t&&3>t&&(e=Math.round(100*e)+"%"),e});return 1===i[3]&&(i.pop(),e="hsl("),e+i.join()+")"},toHexString:function(e){var i=this._rgba.slice(),a=i.pop();return e&&i.push(~~(255*a)),"#"+t.map(i,function(e){return e=(e||0).toString(16),1===e.length?"0"+e:e}).join("")},toString:function(){return 0===this._rgba[3]?"transparent":this.toRgbaString()}}),u.fn.parse.prototype=u.fn,d.hsla.to=function(e){if(null==e[0]||null==e[1]||null==e[2])return[null,null,null,e[3]];var t,i,a=e[0]/255,s=e[1]/255,n=e[2]/255,r=e[3],o=Math.max(a,s,n),h=Math.min(a,s,n),l=o-h,u=o+h,d=.5*u;return t=h===o?0:a===o?60*(s-n)/l+360:s===o?60*(n-a)/l+120:60*(a-s)/l+240,i=0===d||1===d?d:.5>=d?l/u:l/(2-u),[Math.round(t)%360,i,d,null==r?1:r]},d.hsla.from=function(e){if(null==e[0]||null==e[1]||null==e[2])return[null,null,null,e[3]];var t=e[0]/360,i=e[1],a=e[2],s=e[3],r=.5>=a?a*(1+i):a+i-a*i,o=2*a-r;return[Math.round(255*n(o,r,t+1/3)),Math.round(255*n(o,r,t)),Math.round(255*n(o,r,t-1/3)),s]},m(d,function(e,s){var n=s.props,r=s.cache,o=s.to,l=s.from;u.fn[e]=function(e){if(o&&!this[r]&&(this[r]=o(this._rgba)),e===i)return this[r].slice();var s,h=t.type(e),d="array"===h||"object"===h?e:arguments,c=this[r].slice();return m(n,function(e,t){var i=d["object"===h?e:t.idx];null==i&&(i=c[t.idx]),c[t.idx]=a(i,t)}),l?(s=u(l(c)),s[r]=c,s):u(c)},m(n,function(i,a){u.fn[i]||(u.fn[i]=function(s){var n,r=t.type(s),o="alpha"===i?this._hsla?"hsla":"rgba":e,l=this[o](),u=l[a.idx];return"undefined"===r?u:("function"===r&&(s=s.call(this,u),r=t.type(s)),null==s&&a.empty?this:("string"===r&&(n=h.exec(s),n&&(s=u+parseFloat(n[2])*("+"===n[1]?1:-1))),l[a.idx]=s,this[o](l)))})})}),m(o,function(e,i){t.cssHooks[i]={set:function(e,a){var n,r,o="";if("string"!==t.type(a)||(n=s(a))){if(a=u(n||a),!p.rgba&&1!==a._rgba[3]){for(r="backgroundColor"===i?e.parentNode:e;(""===o||"transparent"===o)&&r&&r.style;)try{o=t.css(r,"backgroundColor"),r=r.parentNode}catch(h){}a=a.blend(o&&"transparent"!==o?o:"_default")}a=a.toRgbaString()}try{e.style[i]=a}catch(l){}}},t.fx.step[i]=function(e){e.colorInit||(e.start=u(e.elem,i),e.end=u(e.end),e.colorInit=!0),t.cssHooks[i].set(e.elem,e.start.transition(e.end,e.pos))}}),t.cssHooks.borderColor={expand:function(e){var t={};return m(["Top","Right","Bottom","Left"],function(i,a){t["border"+a+"Color"]=e}),t}},r=t.Color.names={aqua:"#00ffff",black:"#000000",blue:"#0000ff",fuchsia:"#ff00ff",gray:"#808080",green:"#008000",lime:"#00ff00",maroon:"#800000",navy:"#000080",olive:"#808000",purple:"#800080",red:"#ff0000",silver:"#c0c0c0",teal:"#008080",white:"#ffffff",yellow:"#ffff00",transparent:[null,null,null,0],_default:"#ffffff"}}(jQuery),function(){function i(){var t,i,a=this.ownerDocument.defaultView?this.ownerDocument.defaultView.getComputedStyle(this,null):this.currentStyle,s={};if(a&&a.length&&a[0]&&a[a[0]])for(i=a.length;i--;)t=a[i],"string"==typeof a[t]&&(s[e.camelCase(t)]=a[t]);else for(t in a)"string"==typeof a[t]&&(s[t]=a[t]);return s}function a(t,i){var a,s,r={};for(a in i)s=i[a],t[a]!==s&&(n[a]||(e.fx.step[a]||!isNaN(parseFloat(s)))&&(r[a]=s));return r}var s=["add","remove","toggle"],n={border:1,borderBottom:1,borderColor:1,borderLeft:1,borderRight:1,borderTop:1,borderWidth:1,margin:1,padding:1};e.each(["borderLeftStyle","borderRightStyle","borderBottomStyle","borderTopStyle"],function(t,i){e.fx.step[i]=function(e){("none"!==e.end&&!e.setAttr||1===e.pos&&!e.setAttr)&&(jQuery.style(e.elem,i,e.end),e.setAttr=!0)}}),e.effects.animateClass=function(t,n,r,o){var h=e.speed(n,r,o);return this.queue(function(){var n,r=e(this),o=r.attr("class")||"",l=h.children?r.find("*").andSelf():r;l=l.map(function(){var t=e(this);return{el:t,start:i.call(this)}}),n=function(){e.each(s,function(e,i){t[i]&&r[i+"Class"](t[i])})},n(),l=l.map(function(){return this.end=i.call(this.el[0]),this.diff=a(this.start,this.end),this}),r.attr("class",o),l=l.map(function(){var t=this,i=e.Deferred(),a=jQuery.extend({},h,{queue:!1,complete:function(){i.resolve(t)}});return this.el.animate(this.diff,a),i.promise()}),e.when.apply(e,l.get()).done(function(){n(),e.each(arguments,function(){var t=this.el;e.each(this.diff,function(e){t.css(e,"")})}),h.complete.call(r[0])})})},e.fn.extend({_addClass:e.fn.addClass,addClass:function(t,i,a,s){return i?e.effects.animateClass.call(this,{add:t},i,a,s):this._addClass(t)},_removeClass:e.fn.removeClass,removeClass:function(t,i,a,s){return i?e.effects.animateClass.call(this,{remove:t},i,a,s):this._removeClass(t)},_toggleClass:e.fn.toggleClass,toggleClass:function(i,a,s,n,r){return"boolean"==typeof a||a===t?s?e.effects.animateClass.call(this,a?{add:i}:{remove:i},s,n,r):this._toggleClass(i,a):e.effects.animateClass.call(this,{toggle:i},a,s,n)},switchClass:function(t,i,a,s,n){return e.effects.animateClass.call(this,{add:i,remove:t},a,s,n)}})}(),function(){function s(t,i,a,s){return e.isPlainObject(t)&&(i=t,t=t.effect),t={effect:t},null==i&&(i={}),e.isFunction(i)&&(s=i,a=null,i={}),("number"==typeof i||e.fx.speeds[i])&&(s=a,a=i,i={}),e.isFunction(a)&&(s=a,a=null),i&&e.extend(t,i),a=a||i.duration,t.duration=e.fx.off?0:"number"==typeof a?a:a in e.fx.speeds?e.fx.speeds[a]:e.fx.speeds._default,t.complete=s||i.complete,t}function n(t){return!t||"number"==typeof t||e.fx.speeds[t]?!0:"string"!=typeof t||e.effects.effect[t]?!1:i&&e.effects[t]?!1:!0}e.extend(e.effects,{version:"1.9.2",save:function(e,t){for(var i=0;t.length>i;i++)null!==t[i]&&e.data(a+t[i],e[0].style[t[i]])},restore:function(e,i){var s,n;for(n=0;i.length>n;n++)null!==i[n]&&(s=e.data(a+i[n]),s===t&&(s=""),e.css(i[n],s))},setMode:function(e,t){return"toggle"===t&&(t=e.is(":hidden")?"show":"hide"),t},getBaseline:function(e,t){var i,a;switch(e[0]){case"top":i=0;break;case"middle":i=.5;break;case"bottom":i=1;break;default:i=e[0]/t.height}switch(e[1]){case"left":a=0;break;case"center":a=.5;break;case"right":a=1;break;default:a=e[1]/t.width}return{x:a,y:i}},createWrapper:function(t){if(t.parent().is(".ui-effects-wrapper"))return t.parent();var i={width:t.outerWidth(!0),height:t.outerHeight(!0),"float":t.css("float")},a=e("<div></div>").addClass("ui-effects-wrapper").css({fontSize:"100%",background:"transparent",border:"none",margin:0,padding:0}),s={width:t.width(),height:t.height()},n=document.activeElement;try{n.id}catch(r){n=document.body}return t.wrap(a),(t[0]===n||e.contains(t[0],n))&&e(n).focus(),a=t.parent(),"static"===t.css("position")?(a.css({position:"relative"}),t.css({position:"relative"})):(e.extend(i,{position:t.css("position"),zIndex:t.css("z-index")}),e.each(["top","left","bottom","right"],function(e,a){i[a]=t.css(a),isNaN(parseInt(i[a],10))&&(i[a]="auto")}),t.css({position:"relative",top:0,left:0,right:"auto",bottom:"auto"})),t.css(s),a.css(i).show()},removeWrapper:function(t){var i=document.activeElement;return t.parent().is(".ui-effects-wrapper")&&(t.parent().replaceWith(t),(t[0]===i||e.contains(t[0],i))&&e(i).focus()),t},setTransition:function(t,i,a,s){return s=s||{},e.each(i,function(e,i){var n=t.cssUnit(i);n[0]>0&&(s[i]=n[0]*a+n[1])}),s}}),e.fn.extend({effect:function(){function t(t){function i(){e.isFunction(n)&&n.call(s[0]),e.isFunction(t)&&t()}var s=e(this),n=a.complete,r=a.mode;(s.is(":hidden")?"hide"===r:"show"===r)?i():o.call(s[0],a,i)}var a=s.apply(this,arguments),n=a.mode,r=a.queue,o=e.effects.effect[a.effect],h=!o&&i&&e.effects[a.effect];return e.fx.off||!o&&!h?n?this[n](a.duration,a.complete):this.each(function(){a.complete&&a.complete.call(this)}):o?r===!1?this.each(t):this.queue(r||"fx",t):h.call(this,{options:a,duration:a.duration,callback:a.complete,mode:a.mode})},_show:e.fn.show,show:function(e){if(n(e))return this._show.apply(this,arguments);var t=s.apply(this,arguments);return t.mode="show",this.effect.call(this,t)},_hide:e.fn.hide,hide:function(e){if(n(e))return this._hide.apply(this,arguments);var t=s.apply(this,arguments);return t.mode="hide",this.effect.call(this,t)},__toggle:e.fn.toggle,toggle:function(t){if(n(t)||"boolean"==typeof t||e.isFunction(t))return this.__toggle.apply(this,arguments);var i=s.apply(this,arguments);return i.mode="toggle",this.effect.call(this,i)},cssUnit:function(t){var i=this.css(t),a=[];return e.each(["em","px","%","pt"],function(e,t){i.indexOf(t)>0&&(a=[parseFloat(i),t])}),a}})}(),function(){var t={};e.each(["Quad","Cubic","Quart","Quint","Expo"],function(e,i){t[i]=function(t){return Math.pow(t,e+2)}}),e.extend(t,{Sine:function(e){return 1-Math.cos(e*Math.PI/2)},Circ:function(e){return 1-Math.sqrt(1-e*e)},Elastic:function(e){return 0===e||1===e?e:-Math.pow(2,8*(e-1))*Math.sin((80*(e-1)-7.5)*Math.PI/15)},Back:function(e){return e*e*(3*e-2)},Bounce:function(e){for(var t,i=4;((t=Math.pow(2,--i))-1)/11>e;);return 1/Math.pow(4,3-i)-7.5625*Math.pow((3*t-2)/22-e,2)}}),e.each(t,function(t,i){e.easing["easeIn"+t]=i,e.easing["easeOut"+t]=function(e){return 1-i(1-e)},e.easing["easeInOut"+t]=function(e){return.5>e?i(2*e)/2:1-i(-2*e+2)/2}})}()}(jQuery);

/**
 * fullPage 2.6.4
 * https://github.com/alvarotrigo/fullPage.js
 * MIT licensed
 *
 * Copyright (C) 2015 alvarotrigo.com - A project by Alvaro Trigo
 */
(function(d,k,l,n,H){var m=d(k),y=d(l);d.fn.fullpage=function(c){function Da(a){a.find(".fp-slides").after('<div class="fp-controlArrow fp-prev"></div><div class="fp-controlArrow fp-next"></div>');"#fff"!=c.controlArrowColor&&(a.find(".fp-controlArrow.fp-next").css("border-color","transparent transparent transparent "+c.controlArrowColor),a.find(".fp-controlArrow.fp-prev").css("border-color","transparent "+c.controlArrowColor+" transparent transparent"));c.loopHorizontal||a.find(".fp-controlArrow.fp-prev").hide()}
function Ea(){q.append('<div id="fp-nav"><ul></ul></div>');z=d("#fp-nav");z.addClass(function(){return c.showActiveTooltip?"fp-show-active "+c.navigationPosition:c.navigationPosition});for(var a=0;a<d(".fp-section").length;a++){var b="";c.anchors.length&&(b=c.anchors[a]);var b='<li><a href="#'+b+'"><span></span></a>',g=c.navigationTooltips[a];"undefined"!==typeof g&&""!==g&&(b+='<div class="fp-tooltip '+c.navigationPosition+'">'+g+"</div>");b+="</li>";z.find("ul").append(b)}}function ba(){d(".fp-section").each(function(){var a=
d(this).find(".fp-slide");a.length?a.each(function(){I(d(this))}):I(d(this))});d.isFunction(c.afterRender)&&c.afterRender.call(this)}function ca(){var a;if(!c.autoScrolling||c.scrollBar){for(var b=m.scrollTop(),g=0,h=n.abs(b-l.querySelectorAll(".fp-section")[0].offsetTop),e=l.querySelectorAll(".fp-section"),f=0;f<e.length;++f){var k=n.abs(b-e[f].offsetTop);k<h&&(g=f,h=k)}a=d(e).eq(g)}if(!c.autoScrolling||c.scrollBar){if(!a.hasClass("active")){T=!0;b=d(".fp-section.active");g=b.index(".fp-section")+
1;h=U(a);e=a.data("anchor");f=a.index(".fp-section")+1;k=a.find(".fp-slide.active");if(k.length)var q=k.data("anchor"),p=k.index();r&&(a.addClass("active").siblings().removeClass("active"),d.isFunction(c.onLeave)&&c.onLeave.call(b,g,f,h),d.isFunction(c.afterLoad)&&c.afterLoad.call(a,e,f),J(e,f-1),c.anchors.length&&(A=e,V(p,q,e,f)));clearTimeout(da);da=setTimeout(function(){T=!1},100)}c.fitToSection&&(clearTimeout(ea),ea=setTimeout(function(){r&&(d(".fp-section.active").is(a)&&(u=!0),t(a),u=!1)},1E3))}}
function fa(a){return a.find(".fp-slides").length?a.find(".fp-slide.active").find(".fp-scrollable"):a.find(".fp-scrollable")}function K(a,b){if(v[a]){var c,d;"down"==a?(c="bottom",d=e.moveSectionDown):(c="top",d=e.moveSectionUp);if(0<b.length)if(c="top"===c?!b.scrollTop():"bottom"===c?b.scrollTop()+1+b.innerHeight()>=b[0].scrollHeight:void 0,c)d();else return!0;else d()}}function Fa(a){var b=a.originalEvent;if(!ga(a.target)&&W(b)){c.autoScrolling&&a.preventDefault();a=d(".fp-section.active");var g=
fa(a);r&&!B&&(b=ha(b),E=b.y,L=b.x,a.find(".fp-slides").length&&n.abs(M-L)>n.abs(F-E)?n.abs(M-L)>m.width()/100*c.touchSensitivity&&(M>L?v.right&&e.moveSlideRight():v.left&&e.moveSlideLeft()):c.autoScrolling&&n.abs(F-E)>m.height()/100*c.touchSensitivity&&(F>E?K("down",g):E>F&&K("up",g)))}}function ga(a,b){b=b||0;var g=d(a).parent();return b<c.normalScrollElementTouchThreshold&&g.is(c.normalScrollElements)?!0:b==c.normalScrollElementTouchThreshold?!1:ga(g,++b)}function W(a){return"undefined"===typeof a.pointerType||
"mouse"!=a.pointerType}function Ga(a){a=a.originalEvent;c.fitToSection&&w.stop();W(a)&&(a=ha(a),F=a.y,M=a.x)}function ia(a,b){for(var c=0,d=a.slice(n.max(a.length-b,1)),e=0;e<d.length;e++)c+=d[e];return n.ceil(c/b)}function C(a){var b=(new Date).getTime();if(c.autoScrolling){a=k.event||a;var g=a.wheelDelta||-a.deltaY||-a.detail,h=n.max(-1,n.min(1,g));149<D.length&&D.shift();D.push(n.abs(g));c.scrollBar&&(a.preventDefault?a.preventDefault():a.returnValue=!1);a=d(".fp-section.active");a=fa(a);g=b-ja;
ja=b;200<g&&(D=[]);r&&(b=ia(D,10),g=ia(D,70),b>=g&&(0>h?K("down",a):K("up",a)));return!1}c.fitToSection&&w.stop()}function ka(a){var b=d(".fp-section.active").find(".fp-slides");if(b.length&&!B){var g=b.find(".fp-slide.active"),h=null,h="prev"===a?g.prev(".fp-slide"):g.next(".fp-slide");if(!h.length){if(!c.loopHorizontal)return;h="prev"===a?g.siblings(":last"):g.siblings(":first")}B=!0;G(b,h)}}function la(){d(".fp-slide.active").each(function(){X(d(this))})}function t(a,b,g){var h=a.position();if("undefined"!==
typeof h&&(b={element:a,callback:b,isMovementUp:g,dest:h,dtop:h.top,yMovement:U(a),anchorLink:a.data("anchor"),sectionIndex:a.index(".fp-section"),activeSlide:a.find(".fp-slide.active"),activeSection:d(".fp-section.active"),leavingSection:d(".fp-section.active").index(".fp-section")+1,localIsResizing:u},!(b.activeSection.is(a)&&!u||c.scrollBar&&m.scrollTop()===b.dtop))){if(b.activeSlide.length)var e=b.activeSlide.data("anchor"),f=b.activeSlide.index();c.autoScrolling&&c.continuousVertical&&"undefined"!==
typeof b.isMovementUp&&(!b.isMovementUp&&"up"==b.yMovement||b.isMovementUp&&"down"==b.yMovement)&&(b.isMovementUp?d(".fp-section.active").before(b.activeSection.nextAll(".fp-section")):d(".fp-section.active").after(b.activeSection.prevAll(".fp-section").get().reverse()),x(d(".fp-section.active").position().top),la(),b.wrapAroundElements=b.activeSection,b.dest=b.element.position(),b.dtop=b.dest.top,b.yMovement=U(b.element));a.addClass("active").siblings().removeClass("active");r=!1;V(f,e,b.anchorLink,
b.sectionIndex);d.isFunction(c.onLeave)&&!b.localIsResizing&&c.onLeave.call(b.activeSection,b.leavingSection,b.sectionIndex+1,b.yMovement);Ha(b);A=b.anchorLink;J(b.anchorLink,b.sectionIndex)}}function Ha(a){if(c.css3&&c.autoScrolling&&!c.scrollBar)ma("translate3d(0px, -"+a.dtop+"px, 0px)",!0),setTimeout(function(){na(a)},c.scrollingSpeed);else{var b=Ia(a);d(b.element).animate(b.options,c.scrollingSpeed,c.easing).promise().done(function(){na(a)})}}function Ia(a){var b={};c.autoScrolling&&!c.scrollBar?
(b.options={top:-a.dtop},b.element=".fullpage-wrapper"):(b.options={scrollTop:a.dtop},b.element="html, body");return b}function Ja(a){a.wrapAroundElements&&a.wrapAroundElements.length&&(a.isMovementUp?d(".fp-section:first").before(a.wrapAroundElements):d(".fp-section:last").after(a.wrapAroundElements),x(d(".fp-section.active").position().top),la())}function na(a){Ja(a);d.isFunction(c.afterLoad)&&!a.localIsResizing&&c.afterLoad.call(a.element,a.anchorLink,a.sectionIndex+1);r=!0;setTimeout(function(){d.isFunction(a.callback)&&
a.callback.call(this)},600)}function oa(){if(!T){var a=k.location.hash.replace("#","").split("/"),b=a[0],a=a[1];if(b.length){var c="undefined"===typeof A,d="undefined"===typeof A&&"undefined"===typeof a&&!B;(b&&b!==A&&!c||d||!B&&Y!=a)&&Z(b,a)}}}function Ka(a){r&&(a.pageY<N?e.moveSectionUp():a.pageY>N&&e.moveSectionDown());N=a.pageY}function G(a,b){var g=b.position(),h=b.index(),e=a.closest(".fp-section"),f=e.index(".fp-section"),k=e.data("anchor"),l=e.find(".fp-slidesNav"),m=pa(b),n=u;if(c.onSlideLeave){var q=
e.find(".fp-slide.active"),p=q.index(),r;r=p==h?"none":p>h?"left":"right";n||"none"===r||d.isFunction(c.onSlideLeave)&&c.onSlideLeave.call(q,k,f+1,p,r)}b.addClass("active").siblings().removeClass("active");!c.loopHorizontal&&c.controlArrows&&(e.find(".fp-controlArrow.fp-prev").toggle(0!==h),e.find(".fp-controlArrow.fp-next").toggle(!b.is(":last-child")));e.hasClass("active")&&V(h,m,k,f);var t=function(){n||d.isFunction(c.afterSlideLoad)&&c.afterSlideLoad.call(b,k,f+1,m,h);B=!1};c.css3?(g="translate3d(-"+
g.left+"px, 0px, 0px)",qa(a.find(".fp-slidesContainer"),0<c.scrollingSpeed).css(ra(g)),setTimeout(function(){t()},c.scrollingSpeed,c.easing)):a.animate({scrollLeft:g.left},c.scrollingSpeed,c.easing,function(){t()});l.find(".active").removeClass("active");l.find("li").eq(h).find("a").addClass("active")}function sa(){ta();if(O){var a=d(l.activeElement);a.is("textarea")||a.is("input")||a.is("select")||(a=m.height(),n.abs(a-aa)>20*n.max(aa,a)/100&&(e.reBuild(!0),aa=a))}else clearTimeout(ua),ua=setTimeout(function(){e.reBuild(!0)},
500)}function ta(){if(c.responsive){var a=f.hasClass("fp-responsive");m.width()<c.responsive?a||(e.setAutoScrolling(!1,"internal"),e.setFitToSection(!1,"internal"),d("#fp-nav").hide(),f.addClass("fp-responsive")):a&&(e.setAutoScrolling(P.autoScrolling,"internal"),e.setFitToSection(P.autoScrolling,"internal"),d("#fp-nav").show(),f.removeClass("fp-responsive"))}}function qa(a){var b="all "+c.scrollingSpeed+"ms "+c.easingcss3;a.removeClass("fp-notransition");return a.css({"-webkit-transition":b,transition:b})}
function La(a,b){if(825>a||900>b){var c=n.min(100*a/825,100*b/900).toFixed(2);q.css("font-size",c+"%")}else q.css("font-size","100%")}function J(a,b){c.menu&&(d(c.menu).find(".active").removeClass("active"),d(c.menu).find('[data-menuanchor="'+a+'"]').addClass("active"));c.navigation&&(d("#fp-nav").find(".active").removeClass("active"),a?d("#fp-nav").find('a[href="#'+a+'"]').addClass("active"):d("#fp-nav").find("li").eq(b).find("a").addClass("active"))}function U(a){var b=d(".fp-section.active").index(".fp-section");
a=a.index(".fp-section");return b==a?"none":b>a?"up":"down"}function I(a){a.css("overflow","hidden");var b=a.closest(".fp-section"),d=a.find(".fp-scrollable"),e;d.length?e=d.get(0).scrollHeight:(e=a.get(0).scrollHeight,c.verticalCentered&&(e=a.find(".fp-tableCell").get(0).scrollHeight));b=p-parseInt(b.css("padding-bottom"))-parseInt(b.css("padding-top"));e>b?d.length?d.css("height",b+"px").parent().css("height",b+"px"):(c.verticalCentered?a.find(".fp-tableCell").wrapInner('<div class="fp-scrollable" />'):
a.wrapInner('<div class="fp-scrollable" />'),a.find(".fp-scrollable").slimScroll({allowPageScroll:!0,height:b+"px",size:"10px",alwaysVisible:!0})):va(a);a.css("overflow","")}function va(a){a.find(".fp-scrollable").children().first().unwrap().unwrap();a.find(".slimScrollBar").remove();a.find(".slimScrollRail").remove()}function wa(a){a.addClass("fp-table").wrapInner('<div class="fp-tableCell" style="height:'+xa(a)+'px;" />')}function xa(a){var b=p;if(c.paddingTop||c.paddingBottom)b=a,b.hasClass("fp-section")||
(b=a.closest(".fp-section")),a=parseInt(b.css("padding-top"))+parseInt(b.css("padding-bottom")),b=p-a;return b}function ma(a,b){b?qa(f):f.addClass("fp-notransition");f.css(ra(a));setTimeout(function(){f.removeClass("fp-notransition")},10)}function Z(a,b){var c;"undefined"===typeof b&&(b=0);c=isNaN(a)?d('[data-anchor="'+a+'"]'):d(".fp-section").eq(a-1);a===A||c.hasClass("active")?ya(c,b):t(c,function(){ya(c,b)})}function ya(a,b){if("undefined"!=typeof b){var c=a.find(".fp-slides"),d=c.find('[data-anchor="'+
b+'"]');d.length||(d=c.find(".fp-slide").eq(b));d.length&&G(c,d)}}function Ma(a,b){a.append('<div class="fp-slidesNav"><ul></ul></div>');var d=a.find(".fp-slidesNav");d.addClass(c.slidesNavPosition);for(var e=0;e<b;e++)d.find("ul").append('<li><a href="#"><span></span></a></li>');d.css("margin-left","-"+d.width()/2+"px");d.find("li").first().find("a").addClass("active")}function V(a,b,d,e){e="";c.anchors.length&&(a?("undefined"!==typeof d&&(e=d),"undefined"===typeof b&&(b=a),Y=b,za(e+"/"+b)):("undefined"!==
typeof a&&(Y=b),za(d)));Aa()}function za(a){if(c.recordHistory)location.hash=a;else if(O||Q)history.replaceState(H,H,"#"+a);else{var b=k.location.href.split("#")[0];k.location.replace(b+"#"+a)}}function pa(a){var b=a.data("anchor");a=a.index();"undefined"===typeof b&&(b=a);return b}function Aa(){var a=d(".fp-section.active"),b=a.find(".fp-slide.active"),e=a.data("anchor"),h=pa(b),a=a.index(".fp-section"),a=String(a);c.anchors.length&&(a=e);b.length&&(a=a+"-"+h);a=a.replace("/","-").replace("#","");
q[0].className=q[0].className.replace(RegExp("\\b\\s?fp-viewing-[^\\s]+\\b","g"),"");q.addClass("fp-viewing-"+a)}function Na(){var a=l.createElement("p"),b,c={webkitTransform:"-webkit-transform",OTransform:"-o-transform",msTransform:"-ms-transform",MozTransform:"-moz-transform",transform:"transform"};l.body.insertBefore(a,null);for(var d in c)a.style[d]!==H&&(a.style[d]="translate3d(1px,1px,1px)",b=k.getComputedStyle(a).getPropertyValue(c[d]));l.body.removeChild(a);return b!==H&&0<b.length&&"none"!==
b}function Oa(){if(O||Q){var a=Ba();d(".fullpage-wrapper").off("touchstart "+a.down).on("touchstart "+a.down,Ga);d(".fullpage-wrapper").off("touchmove "+a.move).on("touchmove "+a.move,Fa)}}function Pa(){if(O||Q){var a=Ba();d(".fullpage-wrapper").off("touchstart "+a.down);d(".fullpage-wrapper").off("touchmove "+a.move)}}function Ba(){return k.PointerEvent?{down:"pointerdown",move:"pointermove"}:{down:"MSPointerDown",move:"MSPointerMove"}}function ha(a){var b=[];b.y="undefined"!==typeof a.pageY&&(a.pageY||
a.pageX)?a.pageY:a.touches[0].pageY;b.x="undefined"!==typeof a.pageX&&(a.pageY||a.pageX)?a.pageX:a.touches[0].pageX;Q&&W(a)&&(b.y=a.touches[0].pageY,b.x=a.touches[0].pageX);return b}function X(a){e.setScrollingSpeed(0,"internal");G(a.closest(".fp-slides"),a);e.setScrollingSpeed(P.scrollingSpeed,"internal")}function x(a){c.scrollBar?f.scrollTop(a):c.css3?ma("translate3d(0px, -"+a+"px, 0px)",!1):f.css("top",-a)}function ra(a){return{"-webkit-transform":a,"-moz-transform":a,"-ms-transform":a,transform:a}}
function Qa(){x(0);d("#fp-nav, .fp-slidesNav, .fp-controlArrow").remove();d(".fp-section").css({height:"","background-color":"",padding:""});d(".fp-slide").css({width:""});f.css({height:"",position:"","-ms-touch-action":"","touch-action":""});d(".fp-section, .fp-slide").each(function(){va(d(this));d(this).removeClass("fp-table active")});f.addClass("fp-notransition");f.find(".fp-tableCell, .fp-slidesContainer, .fp-slides").each(function(){d(this).replaceWith(this.childNodes)});w.scrollTop(0)}function R(a,
b,d){c[a]=b;"internal"!==d&&(P[a]=b)}function S(a,b){console&&console[a]&&console[a]("fullPage: "+b)}var w=d("html, body"),q=d("body"),e=d.fn.fullpage;c=d.extend({menu:!1,anchors:[],navigation:!1,navigationPosition:"right",navigationTooltips:[],showActiveTooltip:!1,slidesNavigation:!1,slidesNavPosition:"bottom",scrollBar:!1,css3:!0,scrollingSpeed:700,autoScrolling:!0,fitToSection:!0,easing:"easeInOutCubic",easingcss3:"ease",loopBottom:!1,loopTop:!1,loopHorizontal:!0,continuousVertical:!1,normalScrollElements:null,
scrollOverflow:!1,touchSensitivity:5,normalScrollElementTouchThreshold:5,keyboardScrolling:!0,animateAnchor:!0,recordHistory:!0,controlArrows:!0,controlArrowColor:"#fff",verticalCentered:!0,resize:!1,sectionsColor:[],paddingTop:0,paddingBottom:0,fixedElements:null,responsive:0,sectionSelector:".section",slideSelector:".slide",afterLoad:null,onLeave:null,afterRender:null,afterResize:null,afterReBuild:null,afterSlideLoad:null,onSlideLeave:null},c);(function(){c.continuousVertical&&(c.loopTop||c.loopBottom)&&
(c.continuousVertical=!1,S("warn","Option `loopTop/loopBottom` is mutually exclusive with `continuousVertical`; `continuousVertical` disabled"));c.continuousVertical&&c.scrollBar&&(c.continuousVertical=!1,S("warn","Option `scrollBar` is mutually exclusive with `continuousVertical`; `continuousVertical` disabled"));d.each(c.anchors,function(a,b){(d("#"+b).length||d('[name="'+b+'"]').length)&&S("error","data-anchor tags can not have the same value as any `id` element on the site (or `name` element for IE).")})})();
d.extend(d.easing,{easeInOutCubic:function(a,b,c,d,e){return 1>(b/=e/2)?d/2*b*b*b+c:d/2*((b-=2)*b*b+2)+c}});d.extend(d.easing,{easeInQuart:function(a,b,c,d,e){return d*(b/=e)*b*b*b+c}});e.setAutoScrolling=function(a,b){R("autoScrolling",a,b);var g=d(".fp-section.active");c.autoScrolling&&!c.scrollBar?(w.css({overflow:"hidden",height:"100%"}),e.setRecordHistory(c.recordHistory,"internal"),f.css({"-ms-touch-action":"none","touch-action":"none"}),g.length&&x(g.position().top)):(w.css({overflow:"visible",
height:"initial"}),e.setRecordHistory(!1,"internal"),f.css({"-ms-touch-action":"","touch-action":""}),x(0),g.length&&w.scrollTop(g.position().top))};e.setRecordHistory=function(a,b){R("recordHistory",a,b)};e.setScrollingSpeed=function(a,b){R("scrollingSpeed",a,b)};e.setFitToSection=function(a,b){R("fitToSection",a,b)};e.setMouseWheelScrolling=function(a){a?l.addEventListener?(l.addEventListener("mousewheel",C,!1),l.addEventListener("wheel",C,!1)):l.attachEvent("onmousewheel",C):l.addEventListener?
(l.removeEventListener("mousewheel",C,!1),l.removeEventListener("wheel",C,!1)):l.detachEvent("onmousewheel",C)};e.setAllowScrolling=function(a,b){"undefined"!=typeof b?(b=b.replace(/ /g,"").split(","),d.each(b,function(b,c){switch(c){case "up":v.up=a;break;case "down":v.down=a;break;case "left":v.left=a;break;case "right":v.right=a;break;case "all":e.setAllowScrolling(a)}})):a?(e.setMouseWheelScrolling(!0),Oa()):(e.setMouseWheelScrolling(!1),Pa())};e.setKeyboardScrolling=function(a){c.keyboardScrolling=
a};e.moveSectionUp=function(){var a=d(".fp-section.active").prev(".fp-section");a.length||!c.loopTop&&!c.continuousVertical||(a=d(".fp-section").last());a.length&&t(a,null,!0)};e.moveSectionDown=function(){var a=d(".fp-section.active").next(".fp-section");a.length||!c.loopBottom&&!c.continuousVertical||(a=d(".fp-section").first());a.length&&t(a,null,!1)};e.moveTo=function(a,b){var c="",c=isNaN(a)?d('[data-anchor="'+a+'"]'):d(".fp-section").eq(a-1);"undefined"!==typeof b?Z(a,b):0<c.length&&t(c)};e.moveSlideRight=
function(){ka("next")};e.moveSlideLeft=function(){ka("prev")};e.reBuild=function(a){if(!f.hasClass("fp-destroyed")){u=!0;var b=m.width();p=m.height();c.resize&&La(p,b);d(".fp-section").each(function(){var a=d(this).find(".fp-slides"),b=d(this).find(".fp-slide");c.verticalCentered&&d(this).find(".fp-tableCell").css("height",xa(d(this))+"px");d(this).css("height",p+"px");c.scrollOverflow&&(b.length?b.each(function(){I(d(this))}):I(d(this)));1<b.length&&G(a,a.find(".fp-slide.active"))});b=d(".fp-section.active");
b.index(".fp-section")&&t(b);u=!1;d.isFunction(c.afterResize)&&a&&c.afterResize.call(f);d.isFunction(c.afterReBuild)&&!a&&c.afterReBuild.call(f)}};var B=!1,O=navigator.userAgent.match(/(iPhone|iPod|iPad|Android|playbook|silk|BlackBerry|BB10|Windows Phone|Tizen|Bada|webOS|IEMobile|Opera Mini)/),Q="ontouchstart"in k||0<navigator.msMaxTouchPoints||navigator.maxTouchPoints,f=d(this),p=m.height(),u=!1,A,Y,r=!0,D=[],z,v={up:!0,down:!0,left:!0,right:!0},P=d.extend(!0,{},c);d(this).length?(f.css({height:"100%",
position:"relative"}),f.addClass("fullpage-wrapper"),d("html").addClass("fp-enabled")):S("error","Error! Fullpage.js needs to be initialized with a selector. For example: $('#myContainer').fullpage();");c.css3&&(c.css3=Na());e.setAllowScrolling(!0);f.removeClass("fp-destroyed");d(c.sectionSelector).each(function(){d(this).addClass("fp-section")});d(c.slideSelector).each(function(){d(this).addClass("fp-slide")});c.navigation&&Ea();d(".fp-section").each(function(a){var b=d(this),e=d(this).find(".fp-slide"),
f=e.length;a||0!==d(".fp-section.active").length||d(this).addClass("active");d(this).css("height",p+"px");c.paddingTop&&d(this).css("padding-top",c.paddingTop);c.paddingBottom&&d(this).css("padding-bottom",c.paddingBottom);"undefined"!==typeof c.sectionsColor[a]&&d(this).css("background-color",c.sectionsColor[a]);"undefined"!==typeof c.anchors[a]&&(d(this).attr("data-anchor",c.anchors[a]),d(this).hasClass("active")&&J(c.anchors[a],a));if(0<f){a=100*f;var k=100/f;e.wrapAll('<div class="fp-slidesContainer" />');
e.parent().wrap('<div class="fp-slides" />');d(this).find(".fp-slidesContainer").css("width",a+"%");c.controlArrows&&1<f&&Da(d(this));c.slidesNavigation&&Ma(d(this),f);e.each(function(a){d(this).css("width",k+"%");c.verticalCentered&&wa(d(this))});b=b.find(".fp-slide.active");b.length?X(b):e.eq(0).addClass("active")}else c.verticalCentered&&wa(d(this))}).promise().done(function(){e.setAutoScrolling(c.autoScrolling,"internal");var a=d(".fp-section.active").find(".fp-slide.active");a.length&&(0!==d(".fp-section.active").index(".fp-section")||
0===d(".fp-section.active").index(".fp-section")&&0!==a.index())&&X(a);c.fixedElements&&c.css3&&d(c.fixedElements).appendTo(q);c.navigation&&(z.css("margin-top","-"+z.height()/2+"px"),z.find("li").eq(d(".fp-section.active").index(".fp-section")).find("a").addClass("active"));c.menu&&c.css3&&d(c.menu).closest(".fullpage-wrapper").length&&d(c.menu).appendTo(q);c.scrollOverflow?("complete"===l.readyState&&ba(),m.on("load",ba)):d.isFunction(c.afterRender)&&c.afterRender.call(f);ta();if(!c.animateAnchor&&
(a=k.location.hash.replace("#","").split("/")[0],a.length)){var b=d('[data-anchor="'+a+'"]');b.length&&(c.autoScrolling?x(b.position().top):(x(0),w.scrollTop(b.position().top)),J(a,null),d.isFunction(c.afterLoad)&&c.afterLoad.call(b,a,b.index(".fp-section")+1),b.addClass("active").siblings().removeClass("active"))}Aa();m.on("load",function(){var a=k.location.hash.replace("#","").split("/"),b=a[0],a=a[1];b&&Z(b,a)})});var da,ea,T=!1;m.on("scroll",ca);var F=0,M=0,E=0,L=0,ja=(new Date).getTime();m.on("hashchange",
oa);y.keydown(function(a){clearTimeout(Ca);var b=d(l.activeElement);b.is("textarea")||b.is("input")||b.is("select")||!c.keyboardScrolling||!c.autoScrolling||(-1<d.inArray(a.which,[40,38,32,33,34])&&a.preventDefault(),Ca=setTimeout(function(){var b=a.shiftKey;switch(a.which){case 38:case 33:e.moveSectionUp();break;case 32:if(b){e.moveSectionUp();break}case 40:case 34:e.moveSectionDown();break;case 36:e.moveTo(1);break;case 35:e.moveTo(d(".fp-section").length);break;case 37:e.moveSlideLeft();break;
case 39:e.moveSlideRight()}},150))});var Ca;f.mousedown(function(a){2==a.which&&(N=a.pageY,f.on("mousemove",Ka))});f.mouseup(function(a){2==a.which&&f.off("mousemove")});var N=0;y.on("click touchstart","#fp-nav a",function(a){a.preventDefault();a=d(this).parent().index();t(d(".fp-section").eq(a))});y.on("click touchstart",".fp-slidesNav a",function(a){a.preventDefault();a=d(this).closest(".fp-section").find(".fp-slides");var b=a.find(".fp-slide").eq(d(this).closest("li").index());G(a,b)});c.normalScrollElements&&
(y.on("mouseenter",c.normalScrollElements,function(){e.setMouseWheelScrolling(!1)}),y.on("mouseleave",c.normalScrollElements,function(){e.setMouseWheelScrolling(!0)}));d(".fp-section").on("click touchstart",".fp-controlArrow",function(){d(this).hasClass("fp-prev")?e.moveSlideLeft():e.moveSlideRight()});m.resize(sa);var aa=p,ua;e.destroy=function(a){e.setAutoScrolling(!1,"internal");e.setAllowScrolling(!1);e.setKeyboardScrolling(!1);f.addClass("fp-destroyed");m.off("scroll",ca).off("hashchange",oa).off("resize",
sa);y.off("click","#fp-nav a").off("mouseenter","#fp-nav li").off("mouseleave","#fp-nav li").off("click",".fp-slidesNav a").off("mouseover",c.normalScrollElements).off("mouseout",c.normalScrollElements);d(".fp-section").off("click",".fp-controlArrow");a&&Qa()}}})(jQuery,window,document,Math);

/*
 * jQuery JSONP Core Plugin 2.4.0 (2012-08-21)
 *
 * https://github.com/jaubourg/jquery-jsonp
 *
 * Copyright (c) 2012 Julian Aubourg
 *
 * This document is licensed as free software under the terms of the
 * MIT License: http://www.opensource.org/licenses/mit-license.php

example:

$.jsonp({  
   url:'http://192.168.10.111/demo/testjson',  
   data:{rel:13},  
   callbackParameter:"callback",  
    success: function (data) {
    },
    error: function (xOptions, textStatus) {
        console.log(textStatus);
    }
});


 */
( function( $ ) {

    // ###################### UTILITIES ##

    // Noop
    function noop() {
    }

    // Generic callback
    function genericCallback( data ) {
        lastValue = [ data ];
    }

    // Call if defined
    function callIfDefined( method , object , parameters ) {
        return method && method.apply( object.context || object , parameters );
    }

    // Give joining character given url
    function qMarkOrAmp( url ) {
        return /\?/ .test( url ) ? "&" : "?";
    }

    var // String constants (for better minification)
        STR_ASYNC = "async",
        STR_CHARSET = "charset",
        STR_EMPTY = "",
        STR_ERROR = "error",
        STR_INSERT_BEFORE = "insertBefore",
        STR_JQUERY_JSONP = "_jqjsp",
        STR_ON = "on",
        STR_ON_CLICK = STR_ON + "click",
        STR_ON_ERROR = STR_ON + STR_ERROR,
        STR_ON_LOAD = STR_ON + "load",
        STR_ON_READY_STATE_CHANGE = STR_ON + "readystatechange",
        STR_READY_STATE = "readyState",
        STR_REMOVE_CHILD = "removeChild",
        STR_SCRIPT_TAG = "<script>",
        STR_SUCCESS = "success",
        STR_TIMEOUT = "timeout",

        // Window
        win = window,
        // Deferred
        Deferred = $.Deferred,
        // Head element
        head = $( "head" )[ 0 ] || document.documentElement,
        // Page cache
        pageCache = {},
        // Counter
        count = 0,
        // Last returned value
        lastValue,

        // ###################### DEFAULT OPTIONS ##
        xOptionsDefaults = {
            //beforeSend: undefined,
            //cache: false,
            callback: STR_JQUERY_JSONP,
            //callbackParameter: undefined,
            //charset: undefined,
            //complete: undefined,
            //context: undefined,
            //data: "",
            //dataFilter: undefined,
            //error: undefined,
            //pageCache: false,
            //success: undefined,
            //timeout: 0,
            //traditional: false,
            url: location.href
        },

        // opera demands sniffing :/
        opera = win.opera,

        // IE < 10
        oldIE = !!$( "<div>" ).html( "<!--[if IE]><i><![endif]-->" ).find("i").length;

    // ###################### MAIN FUNCTION ##
    function jsonp( xOptions ) {

        // Build data with default
        xOptions = $.extend( {} , xOptionsDefaults , xOptions );

        // References to xOptions members (for better minification)
        var successCallback = xOptions.success,
            errorCallback = xOptions.error,
            completeCallback = xOptions.complete,
            dataFilter = xOptions.dataFilter,
            callbackParameter = xOptions.callbackParameter,
            successCallbackName = xOptions.callback,
            cacheFlag = xOptions.cache,
            pageCacheFlag = xOptions.pageCache,
            charset = xOptions.charset,
            url = xOptions.url,
            data = xOptions.data,
            timeout = xOptions.timeout,
            pageCached,

            // Abort/done flag
            done = 0,

            // Life-cycle functions
            cleanUp = noop,

            // Support vars
            supportOnload,
            supportOnreadystatechange,

            // Request execution vars
            firstChild,
            script,
            scriptAfter,
            timeoutTimer;

        // If we have Deferreds:
        // - substitute callbacks
        // - promote xOptions to a promise
        Deferred && Deferred(function( defer ) {
            defer.done( successCallback ).fail( errorCallback );
            successCallback = defer.resolve;
            errorCallback = defer.reject;
        }).promise( xOptions );

        // Create the abort method
        xOptions.abort = function() {
            !( done++ ) && cleanUp();
        };

        // Call beforeSend if provided (early abort if false returned)
        if ( callIfDefined( xOptions.beforeSend , xOptions , [ xOptions ] ) === !1 || done ) {
            return xOptions;
        }

        // Control entries
        url = url || STR_EMPTY;
        data = data ? ( (typeof data) == "string" ? data : $.param( data , xOptions.traditional ) ) : STR_EMPTY;

        // Build final url
        url += data ? ( qMarkOrAmp( url ) + data ) : STR_EMPTY;

        // Add callback parameter if provided as option
        callbackParameter && ( url += qMarkOrAmp( url ) + encodeURIComponent( callbackParameter ) + "=?" );

        // Add anticache parameter if needed
        !cacheFlag && !pageCacheFlag && ( url += qMarkOrAmp( url ) + "_" + ( new Date() ).getTime() + "=" );

        // Replace last ? by callback parameter
        url = url.replace( /=\?(&|$)/ , "=" + successCallbackName + "$1" );

        // Success notifier
        function notifySuccess( json ) {

            if ( !( done++ ) ) {

                cleanUp();
                // Pagecache if needed
                pageCacheFlag && ( pageCache [ url ] = { s: [ json ] } );
                // Apply the data filter if provided
                dataFilter && ( json = dataFilter.apply( xOptions , [ json ] ) );
                // Call success then complete
                callIfDefined( successCallback , xOptions , [ json , STR_SUCCESS, xOptions ] );
                callIfDefined( completeCallback , xOptions , [ xOptions , STR_SUCCESS ] );

            }
        }

        // Error notifier
        function notifyError( type ) {

            if ( !( done++ ) ) {

                // Clean up
                cleanUp();
                // If pure error (not timeout), cache if needed
                pageCacheFlag && type != STR_TIMEOUT && ( pageCache[ url ] = type );
                // Call error then complete
                callIfDefined( errorCallback , xOptions , [ xOptions , type ] );
                callIfDefined( completeCallback , xOptions , [ xOptions , type ] );

            }
        }

        // Check page cache
        if ( pageCacheFlag && ( pageCached = pageCache[ url ] ) ) {

            pageCached.s ? notifySuccess( pageCached.s[ 0 ] ) : notifyError( pageCached );

        } else {

            // Install the generic callback
            // (BEWARE: global namespace pollution ahoy)
            win[ successCallbackName ] = genericCallback;

            // Create the script tag
            script = $( STR_SCRIPT_TAG )[ 0 ];
            script.id = STR_JQUERY_JSONP + count++;

            // Set charset if provided
            if ( charset ) {
                script[ STR_CHARSET ] = charset;
            }

            opera && opera.version() < 11.60 ?
                // onerror is not supported: do not set as async and assume in-order execution.
                // Add a trailing script to emulate the event
                ( ( scriptAfter = $( STR_SCRIPT_TAG )[ 0 ] ).text = "document.getElementById('" + script.id + "')." + STR_ON_ERROR + "()" )
            :
                // onerror is supported: set the script as async to avoid requests blocking each others
                ( script[ STR_ASYNC ] = STR_ASYNC )

            ;

            // Internet Explorer: event/htmlFor trick
            if ( oldIE ) {
                script.htmlFor = script.id;
                script.event = STR_ON_CLICK;
            }

            // Attached event handlers
            script[ STR_ON_LOAD ] = script[ STR_ON_ERROR ] = script[ STR_ON_READY_STATE_CHANGE ] = function ( result ) {

                // Test readyState if it exists
                if ( !script[ STR_READY_STATE ] || !/i/.test( script[ STR_READY_STATE ] ) ) {

                    try {

                        script[ STR_ON_CLICK ] && script[ STR_ON_CLICK ]();

                    } catch( _ ) {}

                    result = lastValue;
                    lastValue = 0;
                    result ? notifySuccess( result[ 0 ] ) : notifyError( STR_ERROR );

                }
            };

            // Set source
            script.src = url;

            // Re-declare cleanUp function
            cleanUp = function( i ) {
                timeoutTimer && clearTimeout( timeoutTimer );
                script[ STR_ON_READY_STATE_CHANGE ] = script[ STR_ON_LOAD ] = script[ STR_ON_ERROR ] = null;
                head[ STR_REMOVE_CHILD ]( script );
                scriptAfter && head[ STR_REMOVE_CHILD ]( scriptAfter );
            };

            // Append main script
            head[ STR_INSERT_BEFORE ]( script , ( firstChild = head.firstChild ) );

            // Append trailing script if needed
            scriptAfter && head[ STR_INSERT_BEFORE ]( scriptAfter , firstChild );

            // If a timeout is needed, install it
            timeoutTimer = timeout > 0 && setTimeout( function() {
                notifyError( STR_TIMEOUT );
            } , timeout );

        }

        return xOptions;
    }

    // ###################### SETUP FUNCTION ##
    jsonp.setup = function( xOptions ) {
        $.extend( xOptionsDefaults , xOptions );
    };

    // ###################### INSTALL in jQuery ##
    $.jsonp = jsonp;

} )( jQuery );
/*! Copyright (c) 2011 Piotr Rochala (http://rocha.la)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 *
 * Version: 1.3.2 (modified for fullpage.js)
 *
 */
(function(f){jQuery.fn.extend({slimScroll:function(g){var a=f.extend({width:"auto",height:"250px",size:"7px",color:"#000",position:"right",distance:"1px",start:"top",opacity:.4,alwaysVisible:!1,disableFadeOut:!1,railVisible:!1,railColor:"#333",railOpacity:.2,railDraggable:!0,railClass:"slimScrollRail",barClass:"slimScrollBar",wrapperClass:"slimScrollDiv",allowPageScroll:!1,wheelStep:20,touchScrollStep:200,borderRadius:"7px",railBorderRadius:"7px"},g);this.each(function(){function s(d){d=d||window.event;
var c=0;d.wheelDelta&&(c=-d.wheelDelta/120);d.detail&&(c=d.detail/3);f(d.target||d.srcTarget||d.srcElement).closest("."+a.wrapperClass).is(b.parent())&&m(c,!0);d.preventDefault&&!k&&d.preventDefault();k||(d.returnValue=!1)}function m(d,f,g){k=!1;var e=d,h=b.outerHeight()-c.outerHeight();f&&(e=parseInt(c.css("top"))+d*parseInt(a.wheelStep)/100*c.outerHeight(),e=Math.min(Math.max(e,0),h),e=0<d?Math.ceil(e):Math.floor(e),c.css({top:e+"px"}));l=parseInt(c.css("top"))/(b.outerHeight()-c.outerHeight());
e=l*(b[0].scrollHeight-b.outerHeight());g&&(e=d,d=e/b[0].scrollHeight*b.outerHeight(),d=Math.min(Math.max(d,0),h),c.css({top:d+"px"}));b.scrollTop(e);b.trigger("slimscrolling",~~e);u();p()}function C(){window.addEventListener?(this.addEventListener("DOMMouseScroll",s,!1),this.addEventListener("mousewheel",s,!1)):document.attachEvent("onmousewheel",s)}function v(){r=Math.max(b.outerHeight()/b[0].scrollHeight*b.outerHeight(),D);c.css({height:r+"px"});var a=r==b.outerHeight()?"none":"block";c.css({display:a})}
function u(){v();clearTimeout(A);l==~~l?(k=a.allowPageScroll,B!=l&&b.trigger("slimscroll",0==~~l?"top":"bottom")):k=!1;B=l;r>=b.outerHeight()?k=!0:(c.stop(!0,!0).fadeIn("fast"),a.railVisible&&h.stop(!0,!0).fadeIn("fast"))}function p(){a.alwaysVisible||(A=setTimeout(function(){a.disableFadeOut&&w||x||y||(c.fadeOut("slow"),h.fadeOut("slow"))},1E3))}var w,x,y,A,z,r,l,B,D=30,k=!1,b=f(this);if(b.parent().hasClass(a.wrapperClass)){var n=b.scrollTop(),c=b.parent().find("."+a.barClass),h=b.parent().find("."+
a.railClass);v();if(f.isPlainObject(g)){if("height"in g&&"auto"==g.height){b.parent().css("height","auto");b.css("height","auto");var q=b.parent().parent().height();b.parent().css("height",q);b.css("height",q)}if("scrollTo"in g)n=parseInt(a.scrollTo);else if("scrollBy"in g)n+=parseInt(a.scrollBy);else if("destroy"in g){c.remove();h.remove();b.unwrap();return}m(n,!1,!0)}}else{a.height="auto"==g.height?b.parent().height():g.height;n=f("<div></div>").addClass(a.wrapperClass).css({position:"relative",
overflow:"hidden",width:a.width,height:a.height});b.css({overflow:"hidden",width:a.width,height:a.height});var h=f("<div></div>").addClass(a.railClass).css({width:a.size,height:"100%",position:"absolute",top:0,display:a.alwaysVisible&&a.railVisible?"block":"none","border-radius":a.railBorderRadius,background:a.railColor,opacity:a.railOpacity,zIndex:90}),c=f("<div></div>").addClass(a.barClass).css({background:a.color,width:a.size,position:"absolute",top:0,opacity:a.opacity,display:a.alwaysVisible?
"block":"none","border-radius":a.borderRadius,BorderRadius:a.borderRadius,MozBorderRadius:a.borderRadius,WebkitBorderRadius:a.borderRadius,zIndex:99}),q="right"==a.position?{right:a.distance}:{left:a.distance};h.css(q);c.css(q);b.wrap(n);b.parent().append(c);b.parent().append(h);a.railDraggable&&c.bind("mousedown",function(a){var b=f(document);y=!0;t=parseFloat(c.css("top"));pageY=a.pageY;b.bind("mousemove.slimscroll",function(a){currTop=t+a.pageY-pageY;c.css("top",currTop);m(0,c.position().top,!1)});
b.bind("mouseup.slimscroll",function(a){y=!1;p();b.unbind(".slimscroll")});return!1}).bind("selectstart.slimscroll",function(a){a.stopPropagation();a.preventDefault();return!1});h.hover(function(){u()},function(){p()});c.hover(function(){x=!0},function(){x=!1});b.hover(function(){w=!0;u();p()},function(){w=!1;p()});b.bind("touchstart",function(a,b){a.originalEvent.touches.length&&(z=a.originalEvent.touches[0].pageY)});b.bind("touchmove",function(b){k||b.originalEvent.preventDefault();b.originalEvent.touches.length&&
(m((z-b.originalEvent.touches[0].pageY)/a.touchScrollStep,!0),z=b.originalEvent.touches[0].pageY)});v();"bottom"===a.start?(c.css({top:b.outerHeight()-c.outerHeight()}),m(0,!0)):"top"!==a.start&&(m(f(a.start).position().top,null,!0),a.alwaysVisible||c.hide());C()}});return this}});jQuery.fn.extend({slimscroll:jQuery.fn.slimScroll})})(jQuery);

(function (win, spmStr) {
    var date = new Date(),
        doc = win.document,
        isFsSet = false, isPageLoaded = false, sendFs, isAsyncFsSet = false;

    var getPosition = function (img) {
        var pos = 0;

        pos = window.pageYOffset ? window.pageYOffset : document.documentElement.scrollTop;

        try {
            pos += img.getBoundingClientRect().top;
        }
        catch (e) {

        }
        finally {
            return pos;
        }
    };
    var getAsyncTime,
        sendData = function (type, time) {
            wpo.send(type, time);
        };

    var imgsCount = 0,
        sendAsyncFs = function () {
            sendData('afs', getAsyncTime() - date);
        },
        getHandler = function (type) {
            return function () {
                if (this.removeEventListener) {
                    this.removeEventListener(type, arguments.callee, false);
                }
                else if (this.detachEvent) {
                    this.detachEvent('on' + type, arguments.callee);
                }
                if (--imgsCount === 0 && isAsyncFsSet) {
                    //
                    // 因为aysnc FS 函数注册在获取时间函数之前
                    // 先处罚asyncLoaded后触发hanlder
                    //
                    setTimeout(function () {
                        sendAsyncFs();
                    }, 100);
                }
            };
        },

        errHandler = getHandler('error'),
        loadHandler = getHandler('load'),

        asyncLoaded = function (img) {
            var height = document.documentElement.clientHeight,
                pos = getPosition(img);

            if (pos > 0 && pos < height) {
                imgsCount++;
                if (img.addEventListener) {
                    img.addEventListener('load', loadHandler, false);
                    img.addEventListener('error', errHandler, false);
                }
                else if (img.attachEvent) {
                    img.attachEvent('onreadystatechange', function () {
                        if (img.readyState == 'complete') {
                            img.detachEvent('onreadystatechange', arguments.callee);
                            loadHandler.call(img);
                        }
                    });
                    img.attachEvent('onerror', errHandler);
                }
                return true;
            }
        };


    var fetchImgs = function (imgHandler) {
        var imgs = doc.getElementsByTagName('img'),
            curTime = +new Date(),
            imgLogs = [];

        var handler = function () {
            if (this.removeEventListener) {
                this.removeEventListener('load', arguments.callee, false);
            }
            imgLogs.push({
                img: this,
                time: + new Date()
            });
        };

        for (var i = 0, len = imgs.length, img, valid; i < len; i++, valid = true) {
            img = imgs[i];
            if (img.addEventListener && !img.complete) {
                if (typeof imgHandler == 'function') {
                    valid = imgHandler(img);
                }
                if (valid) {
                    img.addEventListener('load', handler, false);
                }
            }
            else if (img.attachEvent && img.readyState != 'complete') {
                if (typeof imgHandler == 'function') {
                    valid = imgHandler(img);
                }
                if (valid) {
                    img.attachEvent('onreadystatechange', (function (idx) {
                        return function () {
                            try{
                                var img = imgs[idx];
                            }
                            catch(e) {
                                return;
                            }
                            if (img.readyState == 'complete') {
                                img.detachEvent('onreadystatechange', arguments.callee);
                                handler.call(img);
                            }
                        };
                    })(i));
                }
            }
            // if (valid && imgHandler) {
            //     imgHandler(img);
            // }
        }

        return function () {
            var height = document.documentElement.clientHeight;

            for (var i = 0, len = imgLogs.length, img, time, pos; i < len; i++) {
                img = imgLogs[i].img;
                time = imgLogs[i].time;
                pos = getPosition(img);
                if (pos > 0 && pos < height) {
                    curTime = time > curTime ? time : curTime;
                }
            }
            imgs = null;
            imgLogs = null;
            return curTime;
        };
    };

    var firstScreen = function (isAsync) {
        var getFsTime;
        if (!isFsSet && !isAsync) {
            getFsTime = fetchImgs();
            sendFs = function () {
                sendData('fs', getFsTime() - date);
            };
            isFsSet = true;
        }
        else if (isAsync && !isAsyncFsSet) {
            getAsyncTime = fetchImgs(asyncLoaded);

            if (!(--wpo.afsCounts)) {
                isAsyncFsSet = true;
            }

            if (!imgsCount) {
                sendAsyncFs();
            }
        }
    };

    var asyncFs = function () {
        firstScreen(true);
    };

    var wpo = {
        send: function (type, value) {
            if (window.JSTracker && JSTracker.send) {
                JSTracker.send({
                    category: type, // 统计的类型
                    delay: value, // 统计的值
                    spm: spmStr // id
                });
            }
            console.log(type, value, spmStr);
        },
        mark: function (type) {
            var enumTypes = {
                "fs": firstScreen,
                "afs": asyncFs
            };
            if (enumTypes[type]) {
                enumTypes[type].call();
            }
            else {
                this.send(type, new Date - date);
            }
        },
        afsCounts: 1
    };

    var domReady = function () {
        if (domReady.ready) {
            return ;
        }

        firstScreen();
        wpo.mark('domready');
        domReady.ready = true;
    };

    var onLoad = function () {
        isPageLoaded = true;

        if (typeof sendFs == 'function') {
            sendFs();
        }

        wpo.mark('loaded');
    };


    if (!win.__WPO) {
        win.__WPO = wpo;
    }
    else {
        for (var name in wpo) {
            win.__WPO[name] = wpo[name];
        }
    }
    var doScrollCheck = function () {
        try {
            document.documentElement.doScroll("left")
        } catch (e) {
            setTimeout(doScrollCheck, 1);
            return
        }
        domReady();
    };

    if (doc.addEventListener) {
        doc.addEventListener('DOMContentLoaded', function () {
            doc.removeEventListener('DOMContentLoaded', arguments.callee);
            domReady();
        }, false);
        win.addEventListener('load', function () {
            doc.removeEventListener('load', arguments.callee);
            onLoad();
        }, false);
    }
    else if (doc.attachEvent) {
        var toplevel = false;
        try {
            toplevel = window.frameElement == null
        } catch (e) {}
        if (document.documentElement.doScroll && toplevel) {
            doScrollCheck()
        }
        if (!domReady.ready) {
            doc.attachEvent('onreadystatechange', function () {
                if (doc.readyState == 'complete') {
                    doc.detachEvent('onreadystatechange', arguments.callee);
                    domReady();
                }
            });
        }

        win.attachEvent('onload', function() {
            win.detachEvent('onload', arguments.callee);
            onLoad();
        });
    }
})(this, window.__spmStr);