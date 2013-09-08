define(['controllers/controllers'], function(controllers){
	
	controllers.controller('register-ctrl', ['$scope', '$location','auth', 
	function ($scope, $location, auth) {

		$scope.err = null;
		$scope.rrm = true;

		$scope.register = function(){
			auth.register($scope.ru, $scope.rp, $scope.rrm, function(status){
				if (status == 400) $scope.err = 'Bad registration request';
			});
			return false;
		};
	}]);
});