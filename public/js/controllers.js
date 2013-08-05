function LoginCtrl = function () {

	$http({
		method: 'POST',
		data: {
			'username': $scope.lu,
			'password': $scope.lp
		},
		headers: {
			'Content-Type': 'application/json'
		},
		url: '/login'
	}).success(function(res) {
			console.log(res);
	});
};

function RegisterCtrl = function(){
	
	$http({
		method: 'POST',
		data: {
			'username': $scope.ru,
			'password': $scope.rp
		},
		url: '/register',
		headers: {
			'Content-Type': 'application/json'
		}
	}).success(function(res) {
			console.log(res);
	});
}

function hmCtrl ($scope, $http) {

	$scope.logout = function(){
		
		$http.get('/logout').success(function(res) {
			console.log(res);	
		});
	}
};

hmCtrl.$inject = ['$scope', '$http'];