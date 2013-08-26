define(['directives/directives'], function(directives){

	directives.directive('doob.sound.picker', function(doobio, $rootScope){
	
		return {
	
			templateUrl: 'partials/template/doob/sound/sound-picker.html',
			restrict: 'E',
			replace: true,
			link: function(scope) {

				// add this scope attribute at runtime...
				scope.context = $rootScope.username;
				var sounds = $rootScope.doob.get(scope.context).sounds;
				for (dummy in $rootScope.doob.get(scope.context).dummyNodes)
					sounds.splice(sounds.indexOf(dummy), 1);
				scope.sounds = sounds;
				scope.loadedSounds = function(){
					scope.noSoundsIndoob = true;
					scope.noSoundsIndoob = scope.sounds.length > 0;
				};
			}
		}
	});
});