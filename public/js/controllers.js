function LoginCtrl($scope, Auth) {

	$scope.lrm = true;
	$scope.rrm = true;

	$scope.login = function(){
		Auth.login($scope.lu, $scope.lp);
		return false;
	};
	$scope.register = function(){
		Auth.register($scope.ru, $scope.rp);
	};
};

function HomeCtrl ($scope, $http, $location, Auth) {

	$http.get('/me').success(function(data, status){
		if (status == 404) return $location.path('/login');
		$scope.username = data;
	});

	$scope.logout = function(){
		$scope.username = null;
		Auth.logout();
	}

	$scope.me = function(){
		$http.get('/me').success(function(data, status){
			if (status == 404) console.log('already expired dude!!');
			else console.log('you\'r good to go buddy: %s status: %s', data, status);
		});
	};
};

// HomeCtrl.$inject = ['$scope', '$http', '$location, Auth'];