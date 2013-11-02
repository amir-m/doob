define(['directives/directives'], function(directives){

	directives.directive('settingsNotifications', [

	function(){
	
		return {
	
			templateUrl: 'partials/template/doob/settings-notifications.html',
			restrict: 'E',			
			link: function(scope, element, attrs) {
			}
		}
	}]);
});