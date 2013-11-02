define(['controllers/controllers'], 
	function(controllers){

		controllers.controller('UploadCtrl', 
			['$scope', 'myinfoz', '$rootScope',
			function ($scope, myinfoz, $rootScope) {

				// $scope.audioid = audioid;
				$rootScope.me = myinfoz;

				$scope.$emit('me:done', $scope.me);
				$("#topnav").slideDown(200);
				$("#btmerrmsg").hide();
				$("#btmloaderimg").hide();	

				$scope.play = function() {
					// var someSound = soundManager.createSound({ 
					// 	// url: '/public/2.mp3'
					// 	url: '/public/1.m4a'
					// });


					// someSound.play();

					console.log($rootScope.me)

					$scope.$emit("success:message", "YESSS")
				}


			}]);
});