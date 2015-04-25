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