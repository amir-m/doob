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
					
					var updated = new Date().getTime();
					
					var promise = doobio.instances[instance].newTrack(sound, pattern.id, updated, true);

					promise.then(function () {

						scope.mappings[pattern.id].updated = updated;					

						console.log(updated);
						console.log(scope.mappings[pattern.id].updated);


						if (scope.$$phase != '$apply' && scope.$$phase != '$digest') {
							scope.$apply();
						}

						scope.$emit("success:message", "Track successfully added.")

					}, function(error) {
						scope.$emit("error:message", "Something went wrong and we couldn`t add the track. Please try again. If it still doesn`t work, please reload the page.")
					});	
					
				}

			}
		}
	}]);
});