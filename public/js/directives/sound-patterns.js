define(['directives/directives'], function(directives){

	directives.directive('doob.sound.patterns', function(){
	
		return {
	
			templateUrl: 'partials/template/doob/sound/sound-patterns.html',
			restrict: 'E',
			// replace: true//,
			// link: function(scope, element, attrs) {
			// 	//
			// }
		}
	});
});