define(['controllers/controllers'], function(controllers){
	
	controllers.controller('register-ctrl', ['$scope', '$location','auth', '$window', 
		'$rootScope', function ($scope, $location, auth, $window, $rootScope) {

		if ($rootScope.username) return $window.history.back();

		$scope.err = null;
		$scope.rrm = true;

		$scope.register = function(){
			auth.register($scope.ru, $scope.rp, $scope.e, $scope.rrm, function(status){
				if (status == 400) $scope.err = 'Bad registration request';
				$scope.$parent.navBar = 'visible';
			});
			return false;
		};
	}]);
});