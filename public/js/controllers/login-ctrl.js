define(['controllers/controllers'], function(controllers){
	
	controllers.controller('login-ctrl', ['$scope', '$location','auth', 
	function ($scope, $location, auth) {

		$scope.err = null;
		$scope.lrm = true;
		$scope.rrm = true;

		$scope.login = function(){
			auth.login($scope.lu, $scope.lp, $scope.lrm, function(status){
				if (status == 401) $scope.err = 'Invalid username or password';
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