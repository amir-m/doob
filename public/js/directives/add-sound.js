define(['directives/directives'], function(directives){

	directives.directive('addSound', ['doobio', function(doobio){

		return {

			templateUrl: 'partials/template/doob/add-sound.html',
			restrict: 'E',
			replace: true,
		
			link: function(scope, element, attrs) {
				
				scope.addSoundToPattern = function(sound, instance, pattern) {
					if (!doobio.instances[instance].env.assets[sound]) {
						new doobio.instances[instance].audio.Sound({
							name: sound,
							url: doobio.instances[instance].env.assets[sound].url
						}, true);
					}
					
					scope.mappings[pattern.id].updated = new Date().getTime();
					
					doobio.instances[instance].env.assets[pattern.name].newTrack(sound, true);

					

					if (scope.$$phase != '$apply' && scope.$$phase != '$digest') {
						scope.$apply();
					}
					
				}

			}
		}
	}]);
});