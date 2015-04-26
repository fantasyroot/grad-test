function route(handle, params, res) {
	if (typeof handle[params.pathname] === 'function'){
		handle[params.pathname](params, res);
	}
	else{
		res.writeHead(404, {"Content-Type": "text/plain"});
		res.write("404 Not Found");
		res.end();
	}
}

exports.route = route;
