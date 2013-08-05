function LoginCtrl($scope, $http) {

	$scope.login = function(){
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

	$scope.register = function(){
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
	};

	$scope.logout = function(){
		$http.get('/logout').success(function(res) {
			console.log(res);	
		});
	}

};



function HomeCtrl ($scope, $http) {

	$http.get('/me').seccess(function(data, status){
		// if (status == 404) redirect to /login...
		$scope.username = data;
	});

	$scope.logout = function(){
		
		$http.get('/logout').success(function(res) {
			console.log(res);	
		});
	}
};

HomeCtrl.$inject = ['$scope', '$http'];