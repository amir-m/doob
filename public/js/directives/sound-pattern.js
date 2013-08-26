define(['directives/directives'], function(directives){

	directives.directive('doob.sound.pattern', function(){
	
		return {
	
			templateUrl: 'partials/template/doob/sound/sound-pattern.html',
			// require: '^soundPatterns',
			restrict: 'E',
			replace: true,
			scope: {
				pattern: '=',
				instanceName: '='
			},
			link: function(scope, element, attrs) {
				scope.beats = function() {
					return new Array(scope.pattern.bars * scope.pattern.steps);
				}
				
				scope.patternSounds = scope.pattern.sounds;
			}
		}
	});
});