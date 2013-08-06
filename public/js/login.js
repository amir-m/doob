// var hostname = 'http://localhost:8080';

var login = function () {
	var u = document.getElementById('lu'),
		p = document.getElementById('lp'),
		err = document.getElementById('err'),
		path = '/login';

	err.value = "";

	console.log(u.value);

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
		callback: function(status) {
			if (status == 401) {
				err.value = "invalid username or password";
				return;
			}
			window.location.href = '/';
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
		callback: function(status) {
			if (status == 400) {
				err.value = "invalid username or password";
				return;
			}
			window.location.href = '/';
		}
	});
};


var http = function(options){

	var request = new XMLHttpRequest();

	request.open(options.method, options.path);

	for (var header in options.headers)
		request.setRequestHeader(header, options.headers[header]);

	request.onload = function() { 
		if (options.callback) options.callback(request.status);

	};

	request.send(JSON.stringify(options.body));
};