define(['directives/directives'], function(directives){

	directives.directive('newSoundPattern', ['doobio', '$rootScope', 
		function(doobio, $rootScope){
	
		return {
	
			templateUrl: 'partials/template/doob/sound/new-sound-pattern.html',
			restrict: 'E',
			replace: true,
			
			link: function(scope, element) {

				scope.focus = function(){
					$('#spname').focus();
					$('#spname').val('');
					$('#spnamedropdown').show();
					// scope.$apply()
				}

				scope.addSound = function(i, j){

					new doobio.instances[scope.instanceName].audio.Sound({
						name: scope.listBindToSound[scope.soundList.indexOf(i)][j].name,
						url: scope.listBindToSound[scope.soundList.indexOf(i)][j].url
					}, true);
				};
			}
		}
	}]);
});