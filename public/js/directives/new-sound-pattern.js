define(['directives/directives'], function(directives){

	directives.directive('newSoundPattern', ['doobio', '$rootScope', 
		function(doobio, $rootScope){
	
		return {
	
			templateUrl: 'partials/template/doob/new-sound-pattern.html',
			restrict: 'E',
			replace: true,
			
			link: function(scope, element) {

				scope.focusClass = "plus";
				scope.focused = false;

				scope.toggleFocus = function(){
					
					if (!scope.focused) {
						$('#spnamedropdown').fadeIn();
						$('#spname').focus();
						$('#spname').val('');
						scope.focusClass = "cancel";
					}
					else {
						$('#spnamedropdown').fadeOut();
						scope.focusClass = "plus";
					}

					scope.focused = !scope.focused;
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