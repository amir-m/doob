define(['directives/directives'], function(directives){

	directives.directive('soundPattern', ['doobio', function(doobio){
	
		return {
	
			templateUrl: 'partials/template/doob/sound-pattern.html',
			// require: '^soundPatterns',
			restrict: 'E',
			replace: true,
			// scope: {
			// 	pattern: '=',
			// 	instanceName: '='
			// },
			link: function(scope, element, attrs) {

				element.bind("$destroy", function() {
					scope.stop(scope.instanceName, scope.pattern);
					scope.$destroy();

				});

				scope.totalNotes = function() {
					return new Array(scope.pattern.steps);
				};
				
				scope.removeTrack = function(track) {
					scope.patternInfo.updated = new Date().getTime();
					doobio.instances[scope.instanceName].env.assets[scope.pattern.name].removeTrack(track, true);
					// console.log(sound)
				}
				scope.toggleNote = function(i, patternSound) {
					
					scope.patternInfo.updated = new Date().getTime();
					doobio.instances[scope.instanceName].env.assets[scope.pattern.name].toggleNote(i, patternSound, true);

					// on = !on;
					// scope.onOff = on ? onClass : offClass;
					// scope.icon = on ? onIcon : offIcon;
				};

				scope.play = function(instanceName, p, flag){

					doobio.instances[instanceName].env.assets[p.name].tempo = p.tempo
					doobio.instances[instanceName].env.assets[p.name].steps = p.steps
					doobio.instances[instanceName].env.assets[p.name].play(flag);
					// console.log(doobio.instances[instanceName].env.assets[p.name]);
				};

				scope.stop = function(instanceName, p, flag){
					doobio.instances[instanceName].env.assets[p.name].stop();
				};


				// console.log(scope.instanceName)
				
				// scope.patternSounds = scope.pattern.sounds;
			}
		}
	}]);
});