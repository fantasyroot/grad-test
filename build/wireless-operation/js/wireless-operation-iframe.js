(function(){
    var LocalStorage = {
        setItem: function(key, value, expires){
            if (expires < 0) {
                this.removeItem(key);
                return;
            }
            //设置过期时间
            var date = new Date(),
                expires = expires || (24 * 60 * 60);      //默认为一天
            date.setTime(date.getTime() + expires * 1000);
         
            if (window.localStorage){
                var o = {val: value, timestamp: date.getTime()};
                localStorage.setItem(key, JSON.stringify(o));
            } else {
                try {
                    var input = this._getInstance();
                    input.expires = date.toUTCString();
                    input.setAttribute(key, value);
                    input.save(key);
                } catch (e) {
                }
            }
        },
        getItem: function(key){
            if (window.localStorage){
                var o = localStorage.getItem(key);
                if (o) {
                    o = JSON.parse(localStorage.getItem(key));
                    if (new Date().getTime() < o.timestamp) {  //判断是否过期
                        return o.val;
                    }   
                }
                return null;
            } else {
                try {
                    var input = this._getInstance();
                    input.load(key);
                    //取得数据
                    return input.getAttribute(key) || null;
                } catch (e) {
                    return null;           
                }
            }
        },
        removeItem: function(key) {
            if (window.localStorage){
                localStorage.removeItem(key);
            } else {
                try {
                    var input = this._getInstance();
                    input.load(key);
                    input.removeAttribute(key);
                    var date = new Date();
                    date.setTime(date.getTime() - 1);
                    input.expires = date.toUTCString();
                    input.save(key);
                } catch (e) {}
            }
        },
        _getInstance: function(){
            var _input = null;
            _input = document.createElement("input");
            _input.type = "hidden";
            _input.addBehavior("#default#userData");
            setTimeout(function(){document.body.appendChild(_input)},1000)
            return _input;
        }
    };
    
    var more=false;
    for(i=0;i<2;i++){
        if(parseInt($(".nav").eq(i).children('ul').css("width"))>parseInt($(".nav").eq(i).children('ul').css("max-width"))-20){
            $(".nav").eq(i).children('.navmore').show();
        }
    }
    
    $(".navmore").click(function(){
        if(!more){
            $(this).parents(".nav").css("height","auto");
            $(this).css("background",'url("//gtms04.alicdn.com/tps/i4/TB1XcSIHXXXXXbMXpXXXG0.HXXX-50-20.jpg")');
        }else{
            $(this).parents(".nav").css("height","38px");
            $(this).css("background",'url("//gtms03.alicdn.com/tps/i3/TB1._W_HXXXXXXrXXXXXG0.HXXX-50-20.jpg")');
        }
        more=!more;
    });

     var car = '<div id="myCarousel2" class="carousel2 slide"><div class="carousel2-wrap">'+
          '<i class="close J_close"></i>'+
          '<ol class="carousel2-indicators">'+
            '<li data-slides-to="0" class="active"></li>'+
            '<li data-slides-to="1"></li>'+
            '<li data-slides-to="2"></li>'+
            '<li data-slides-to="3"></li>'+
          '</ol>'+
          '<div class="carousel2-inner">'+
            '<div class="active item" style="background:url(//gtms01.alicdn.com/tps/i1/TB1v3TmHXXXXXcbXpXXqv7lHpXX-806-532.jpg) no-repeat;"><a href="javascript:;" data-slides-to="1" class="nextstep sui-btn btn-xlarge btn-primary">下一步</a></div>'+
            '<div class="item" style="background:url(//gtms04.alicdn.com/tps/i4/TB1S3LiHXXXXXceXFXXqv7lHpXX-806-532.jpg) no-repeat;"><a href="javascript:;" data-slides-to="2" class="nextstep sui-btn btn-xlarge btn-primary">下一步</a></div>'+
            '<div class="item" style="background:url(//gtms03.alicdn.com/tps/i3/TB1nMfcHXXXXXXAaXXXqv7lHpXX-806-532.jpg) no-repeat;"><a href="javascript:;" data-slides-to="3" class="nextstep sui-btn btn-xlarge btn-primary">下一步</a></div>'+
            '<div class="item" style="background:url(//gtms02.alicdn.com/tps/i2/TB15bTmHXXXXXcXXpXXqv7lHpXX-806-532.jpg) no-repeat;"><a href="javascript:;" class="J_close sui-btn btn-xlarge btn-primary">立即使用</a></div>'+
          '</div></div></div>';

        if(!LocalStorage.getItem('carousel')){
            LocalStorage.setItem('carousel',0,100000000);
            var ie6=!-[1,]&&!window.XMLHttpRequest;
            !ie6 && carousel();
        }
        
        function carousel(){
            $('body').append(car);
            //var $carousel = $("#myCarousel2").carousel({});
            $('#myCarousel2 ol li').on('click',function(e){
                LocalStorage.setItem('carousel',1,100000000);
                var index = parseInt($(this).attr('data-slides-to'));
                $(this).addClass('active').siblings('li').removeClass('active');
                $('#myCarousel2 .carousel2-inner .item').removeClass('active').eq(index).addClass('active');

            });
            //点击下一步的事件
            $('#myCarousel2 .nextstep').on('click', function(e){
                LocalStorage.setItem('carousel',1,100000000);
                var index = parseInt($(this).attr('data-slides-to'));
                $($('#myCarousel2 ol li')[index]).trigger('click');
            });
            $('#myCarousel2 .J_close').on('click',function(e){
                LocalStorage.setItem('carousel',1,100000000);
                $('#myCarousel2').hide();
            });
        }
        
})();

        
        



