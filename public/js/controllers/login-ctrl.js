define(['controllers/controllers'], function(controllers){
	
	controllers.controller('login-ctrl', ['$scope', '$location','Auth', 
	function ($scope, $location, Auth) {

		var promise = Auth.authenticate();

		promise.then(function(value){
			console.log(value)
			return $location.path('/home');
		});

		$scope.err = null;
		$scope.lrm = true;
		$scope.rrm = true;

		$scope.login = function(){
			Auth.login($scope.lu, $scope.lp, $scope.lrm, function(status){
				if (status == 401) $scope.err = 'Invalid username or password';
			});
			return false;
		};

		$scope.register = function(){
			Auth.register($scope.ru, $scope.rp, $scope.rrm, function(status){
				if (status == 400) $scope.err = 'Bad registration request';
			});
			return false;
		};
	}]);
});