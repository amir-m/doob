define(['controllers/controllers'], 
	function(controllers){

		controllers.controller('UploadCtrl', 
			['$scope', 'myinfoz', '$rootScope',
			function ($scope, myinfoz, $rootScope) {
				$rootScope.me = myinfoz;

				$scope.$emit('me:done', $scope.me);
				$("#topnav").slideDown(200);
				$("#btmerrmsg").hide();
				$("#btmloaderimg").hide();	

				$scope.play = function() {
					$scope.$emit("success:message", "play")
				}


			}]);
});