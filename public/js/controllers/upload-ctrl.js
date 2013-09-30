define(['controllers/controllers'], 
	function(controllers){

		controllers.controller('UploadCtrl', 
			['$scope', 'myinfoz',
			function ($scope, myinfoz) {

				// $scope.audioid = audioid;
				$scope.me = myinfoz;

				$scope.$emit('me:done', $scope.me);
				$("#topnav").slideDown(200);
				$("#btmerrmsg").hide();
				$("#btmloaderimg").hide();	


			}]);
});