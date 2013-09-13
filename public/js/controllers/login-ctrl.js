define(['controllers/controllers'], function(controllers){
	
	controllers.controller('LoginCtrl', ['$scope', '$location','auth', '$rootScope', 'authenticate', 
	function ($scope, $location, auth, $rootScope, authenticate) {

		$scope.err = null;
		$scope.lrm = true;
		$scope.rrm = true;

		$("#btmloaderimg").hide();
		$("#btmerrmsg").hide();
		$("#topnav").hide();
		

		$scope.login = function(){
			var promise = auth.login($scope.lu, $scope.lp, $scope.lrm);	

			promise.then(function(username){
				$location.path('/home');
				$scope.$emit("success:message", 'Welcome back ' + $rootScope.username + '!');
			}, function(){
				$scope.$emit("error:message", 'Invalid username or password!');
			});
			return false;
		};
	}]);
});