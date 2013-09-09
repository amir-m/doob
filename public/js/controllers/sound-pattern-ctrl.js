define(['controllers/controllers'], 
function(controllers){
	
	controllers.controller('user-ctrl', ['$scope', '$location', '$rootScope', 'user',
	function ($scope, $location, $rootScope, user) {
		$scope.user = user;

		$scope.show = function() {
			console.log($scope.user)
		}
	}]);
});