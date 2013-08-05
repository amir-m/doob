function hmCtrl ($scope, $http) {
	
	var hostname = 'http://localhost:8080';

	$scope.login = function () {
		var path = hostname + '/login';

		$http({
			method: 'POST',
			data: {
				'username': $scope.lu,
				'password': $scope.lp
			},
			headers: {
				'Content-Type': 'application/json'
			},
			url: path
		}).success(function(res) {
				console.log(res);
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
}