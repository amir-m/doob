define(['controllers/controllers'], 
function(controllers){
	
	controllers.controller('sound-pattern-ctrl', ['$scope', '$location', '$rootScope', 'loaded',
	function ($scope, $location, $rootScope, loaded) {
		$scope.loaded = loaded;

		$scope.show = function() {
			console.log($scope.user)
		}
	}]);
});