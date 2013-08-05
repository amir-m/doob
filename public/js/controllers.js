function hmCtrl ($scope, $http) {
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

		return false;
	};
}