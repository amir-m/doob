define(['controllers/controllers'], function(controllers){
	
	controllers.controller('RegisterCtrl', ['$scope', '$location','auth', '$window', 
		'$routeParams', '$rootScope', 
		function ($scope, $location, auth, $window, $routeParams, $rootScope) {

		if ($rootScope.username) return $window.history.back();

		console.log($routeParams)

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