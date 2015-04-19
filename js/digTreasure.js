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
                            status="";
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
                     data.award="prize03";
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
