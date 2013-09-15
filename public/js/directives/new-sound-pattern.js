define(['directives/directives'], function(directives){

	directives.directive('newSoundPattern', ['doobio', '$rootScope', 
		function(doobio, $rootScope){
	
		return {
	
			templateUrl: 'partials/template/doob/sound/new-sound-pattern.html',
			restrict: 'E',
			replace: true,
			
			link: function(scope, element) {

				scope.focus = function(){
					$('#spnamedropdown').fadeIn();
					$('#spname').focus();
					$('#spname').val('');
					// scope.$apply()
				}

				scope.addSound = function(i, j){

					new doobio.instances[scope.instanceName].sound({
						name: scope.listBindToSound[scope.soundList.indexOf(i)][j].name,
						url: scope.listBindToSound[scope.soundList.indexOf(i)][j].url
					}, true);
				};
			}
		}
	}]);
});