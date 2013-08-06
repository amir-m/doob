
var login = function () {
	var u = document.getElementById('lu'),
		p = document.getElementById('lp'),
		path = '/login';

	var err = document.getElementById('err'); 

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
				err.innerHTML = "Invalid username or password";
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

	var err = document.getElementById('err'); 

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
				err.innerHTML = "Bad registeration request";
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
		console.log(request.status)
		if (options.callback) options.callback(request.status);

	};

	request.send(JSON.stringify(options.body));
};