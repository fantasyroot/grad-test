var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");

var handle = {};

handle["/"] = requestHandlers.get_winner;
handle["/get_winner"] = requestHandlers.get_winner;
handle["/get_lottery"] = requestHandlers.get_lottery;
handle["/get_state"] = requestHandlers.get_state;
handle["/upload"] = requestHandlers.upload;

server.start(router.route, handle);
