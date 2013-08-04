
var hostname = 'http://localhost:8080';

var login = function () {
	var u = document.getElementById('l-u'),
		p = document.getElementById('l-p'),
		path = hostname + '/login';

	http({
		'method': 'POST',
		'body': {
			'username': u.value,
			'password': p.value
		},
		'path': path,
		'headers': {
			'Content-Type': 'application/json'
		},
		callback: function(res) {
			console.log(res);
		}
	});

	// console.log(u.value);
	// console.log(p.value);

	return false;
};

var register = function(){
	var u = document.getElementById('r-u'),
		p = document.getElementById('r-p'),
		path = hostname + '/register';

	http({
		'method': 'POST',
		'body': {
			'username': u.value,
			'password': p.value
		},
		'path': path,
		'headers': {
			'Content-Type': 'application/json'
		},
		callback: function(res) {
			console.log(res);
		}
	});
};

var logout = function(){
	var u = document.getElementById('l-u'),
		p = document.getElementById('l-p'),
		path = hostname + '/logout';

	http({
		'method': 'POST',
		'body': {
			'username': u.value,
			'password': p.value
		},
		'path': path,
		'headers': {
			'Content-Type': 'application/json'
		},
		callback: function(res) {
			console.log(res);
		}
	});
};

var http = function(options){

	var request = new XMLHttpRequest();

	request.open(options.method, options.path);

	for (var header in options.headers)
		request.setRequestHeader(header, options.headers[header]);

	request.onload = function() { 
		if (options.callback) options.callback(request.response);
	};

	request.send(JSON.stringify(options.body));
};