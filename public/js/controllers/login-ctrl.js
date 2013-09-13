define(['controllers/controllers'], function(controllers){
	
	controllers.controller('login-ctrl', ['$scope', '$location','auth', '$rootScope', 
	function ($scope, $location, auth, $rootScope) {

		$scope.err = null;
		$scope.lrm = true;
		$scope.rrm = true;

		$scope.$parent.navBar = 'invisible';
		
		var promise = auth.authenticate();	

		promise.then(function(username){
			// $rootScope.username = username;
			$location.path('/home');
			$scope.$parent.navBar = 'visible';
		});

		// $scope.$parent.authenticate(function(err, username){
		// 	if (err) return;
		// 	$location.path('/home');
		// 	$scope.$parent.navBar = 'visible';
		// }) 

		$scope.login = function(){
			auth.login($scope.lu, $scope.lp, $scope.lrm, function(status){
				if (status == 401) $scope.err = 'Invalid username or password';
				else if (status == 200) $scope.$parent.navBar = 'visible';
			});
			return false;
		};

		$scope.register = function(){
			auth.register($scope.ru, $scope.rp, $scope.rrm, function(status){
				if (status == 400) $scope.err = 'Bad registration request';
			});
			return false;
		};
	}]);
});