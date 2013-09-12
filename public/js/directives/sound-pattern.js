define(['directives/directives'], function(directives){

	directives.directive('doob.sound.pattern', ['doobio', function(doobio){
	
		return {
	
			templateUrl: 'partials/template/doob/sound/sound-pattern.html',
			// require: '^soundPatterns',
			restrict: 'E',
			replace: true,
			// scope: {
			// 	pattern: '=',
			// 	instanceName: '='
			// },
			link: function(scope, element, attrs) {
				
				scope.beats = function() {
					return new Array(scope.pattern.steps);
				}
				scope.removeTrack = function(track) {
					
					scope.pattern.removeTrack(track, true);
					// console.log(sound)
				}
				scope.toggleNote = function(i, patternSound) {
					
					scope.patternInfo.updated = new Date().getTime();
					doobio.instances[scope.instanceName].env.assets[scope.pattern.name].toggleNote(i, patternSound, true);

					// on = !on;
					// scope.onOff = on ? onClass : offClass;
					// scope.icon = on ? onIcon : offIcon;
				};

				


				// console.log(scope.instanceName)
				
				// scope.patternSounds = scope.pattern.sounds;
			}
		}
	}]);
});