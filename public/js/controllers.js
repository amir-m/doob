function hmCtrl ($scope, $http) {
	
	var hostname = 'http://localhost:8080';

	$scope.login = function () {

		$http({
			method: 'POST',
			data: {
				'username': $scope.lu,
				'password': $scope.lp
			},
			headers: {
				'Content-Type': 'application/json'
			},
			url: hostname + '/login'
		}).success(function(res) {
				console.log(res);
		});
	};

	$scope.register = function(){
		
		$http({
			method: 'POST',
			data: {
				'username': $scope.ru,
				'password': $scope.rp
			},
			url: hostname + '/register',
			headers: {
				'Content-Type': 'application/json'
			}
		}).success(function(res) {
				console.log(res);
		});
	}
}