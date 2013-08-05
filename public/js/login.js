// var hostname = 'http://localhost:8080';

var login = function () {
	var u = document.getElementById('lu'),
		p = document.getElementById('lp'),
		path = '/login';

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
	var u = document.getElementById('ru'),
		p = document.getElementById('rp'),
		path = '/register';

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
	var path = '/logout';

	http({
		'method': 'GET',
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

	request.send(options.body);
};