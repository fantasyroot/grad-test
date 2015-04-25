var http = require("http");

http.createServer(function(request, response) {
	response.writeHead(200, {"Content-Type": "text/plain"});
	response.write('jQuery203027518601110205054_1429618054315([{"name":"t**c","prize":"prize01"},{"name":"t**c","prize":"prize01"},{"name":"t**c","prize":"prize01"}])');
	response.end();
}).listen(8888);
