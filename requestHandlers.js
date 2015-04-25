function get_winner(params, res){
	console.log("Request handler 'get_winner' was called.");
    res.writeHead(200, { 'Content-Type': 'text/html' });
    var data = [{"name":"t**c","prize":"prize01"},{"name":"t**c","prize":"prize01"},{"name":"t**c","prize":"prize01"}];
    if (params.query && params.query.jsoncallback) {
        var str =  params.query.jsoncallback + '(' + JSON.stringify(data) + ')'; //jsonp
        res.end(str);
    }
    else {
        res.end('jsoncallback(' + JSON.stringify(data) + ')'); //普通的json
    }
}

function get_lottery(params, res){
    console.log("Request handler 'get_lottery' was called.");
    res.writeHead(200, { 'Content-Type': 'text/html' });
    //var data = {"award":"0"};   //没中奖或者没有资格
    //var data = {"award":"prize02"};
    var data = {"award":"prize01"};
    if (params.query && params.query.jsoncallback) {
        var str =  params.query.jsoncallback + '(' + JSON.stringify(data) + ')'; //jsonp
        res.end(str);
    }
    else {
        res.end('jsoncallback(' + JSON.stringify(data) + ')'); //普通的json
    }
}

function get_state(params, res){
    console.log("Request handler 'get_state' was called.");
    res.writeHead(200, { 'Content-Type': 'text/html' });
    var data = "AvailableState";
    //var data = "UnableState";
    //var data = "IllagelSate";
    if (params.query && params.query.jsoncallback) {
        var str =  params.query.jsoncallback + '(' + JSON.stringify(data) + ')'; //jsonp
        res.end(str);
    }
    else {
        res.end('jsoncallback(' + JSON.stringify(data) + ')'); //普通的json
    }
}


exports.get_winner = get_winner;
exports.get_lottery = get_lottery;
exports.get_state = get_state;
