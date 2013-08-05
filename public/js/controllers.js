function LoginCtrl($scope, $http, $location, Auth) {

	$scope.lrm = true;
	$scope.rrm = true;

	$scope.login = function(){
		Auth.login($scope.lu, $scope.lp);
	};

	// $scope.login = function(){
	// 	$http({
	// 		method: 'POST',
	// 		data: {
	// 			'username': $scope.lu,
	// 			'password': $scope.lp
	// 		},
	// 		headers: {
	// 			'Content-Type': 'application/json'
	// 		},
	// 		url: '/login'
	// 	}).success(function(res) {
	// 			console.log(res);
	// 			$location.path('/home')
	// 	});
	// };

	// Todo: set cookie for remember me...

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
				$location.path('/home')
		});
	};
};

function HomeCtrl ($scope, $http, $location) {

	$http.get('/me').success(function(data, status){
		if (status == 404) return $location.path('/login');
		$scope.username = data;
	});

	$scope.logout = function(){
		
		$http.get('/logout').success(function(res) {
			console.log(res);	
			$scope.username = null;
			$location.path('/login')

			// TODO: 	redirect to login
		});
	}
};

HomeCtrl.$inject = ['$scope', '$http', '$location'];