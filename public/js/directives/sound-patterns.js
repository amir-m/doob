define(['directives/directives'], function(directives){

	directives.directive('doob.sound.patterns', ['doobio', function(doobio) {
		return {
	
			templateUrl: 'partials/template/doob/sound/sound-patterns.html',
			restrict: 'E',
		}
	}]);
});