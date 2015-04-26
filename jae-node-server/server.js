var http = require("http");
var url = require('url');

function start(route, handle){
	http.createServer(function(req, res) {

		var params = url.parse(req.url, true); //true => {name:'a',id:'5'} //false => name=a&id=5
		route(handle, params, res);

	}).listen(process.env.PORT || 1337, null);
	console.log("Server has started.");
}

exports.start = start;
