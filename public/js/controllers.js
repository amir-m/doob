function LoginCtrl($scope, Auth, $location) {

	if (Auth.me) $location.path('/home');

	$scope.err = null;
	$scope.lrm = true;
	$scope.rrm = true;

	$scope.login = function(){
		Auth.login($scope.lu, $scope.lp, function(status){
			if (status == 401) $scope.err = 'Invalid username or password';
		});
		return false;
	};
	$scope.register = function(){
		Auth.register($scope.ru, $scope.rp, function(status){
			if (status == 400) $scope.err = 'Bad registration request';
		});
		return false;
	};
};

function HomeCtrl ($scope, $location, Auth) {

	if (!Auth.me) $location.path('/login');

	$scope.username = Auth.username;

	$scope.logout = function(){
		$scope.username = null;
		Auth.logout();
	}

	$scope.me = function(){
		console.log(Auth.me);
	};
};

// HomeCtrl.$inject = ['$scope', '$http', '$location, Auth'];