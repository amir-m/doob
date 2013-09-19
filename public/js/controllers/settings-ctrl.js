define(['controllers/controllers'], 
	function(controllers){

		controllers.controller('SettingsCtrl', 
		['$scope', 'settings', 'me', '$http', '$routeParams', '$compile', '$location',
		function ($scope, settings, me, $http, $routeParams, $compile, $location) {

			$scope.settings = settings;

			$("#topnav").slideDown(200);
			$("#btmerrmsg").hide();
			$("#btmloaderimg").hide();	


			if ($routeParams.setting) 
				show($routeParams.setting);
			else $location.redirect('/settings/security')

			function show (setting) {
				
				var map = {
					"security": "<settings-security></settings-security>",
					// "security": "settings-security"
					"notifications": "<settings-notifications></settings-notifications>"
				};

				if (setting in map) {

					// var settingScope = angular.element('#stngscnt').scope();

					// angular.element('#stngscnt').scope = $scope.$new();

					// var settingScope = angular.element('#stngscnt').scope();

					// console.log(settingScope) $scope.$new()

					$('#stngscnt').empty();
					$('#stngscnt').append($compile(map[setting])($scope.$new()));
					if ($scope.$$phase != "$apply" && $scope.$$phase != "$digest")
						$scope.$apply();

				}	

			};
		
			$scope.getNotificationState = function(index) {
				var t;
				$scope.settings[0].notifications[index] ? (t = "Off") : (t = "On");
				return t;
			};

			$scope.toggleNotificationState = function (index) {

				link = '/settings?notifications=1&' + index 
				+ '=' +!$scope.settings[0].notifications[index];
				
				console.log(link);
				$http.put(link).success(function(){
					$scope.settings[0].notifications[index] = !$scope.settings[0].notifications[index];
				}).error(function(){
					$scope.$emit("error:message", "We couldn`t save the settings. Could you please try again a bit later?");
				});
			}

			// var me = me();

			// me.then(function(m){
			// 	$scope.$emit('me:done', m);
			// }, function(reason){
			// 	$scope.$emit('error:message', reason);
			// });


		}]);
});