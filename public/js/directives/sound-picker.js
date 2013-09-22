define(['directives/directives'], function(directives){

	directives.directive('soundPicker', ['doobio', '$rootScope', 
		function(doobio, $rootScope){
	
		return {
	
			templateUrl: 'partials/template/doob/sound-picker.html',
			restrict: 'E',
			replace: true,
			
			link: function(scope, element) {
				
				element.bind('click', function (e) {
                    e.stopPropagation();
                });

                

				scope.soundList = [];
				scope.soundObjects = [];
				scope.listBindToSound = []; 
				scope.loadedList = [];

				var list = []; 

				scope.loadCatergorySounds = function(i) {
					
					if (!scope.loadedList[i]) {

						scope.loadedList[i] = true;
						scope.soundObjects[i] = [];

						for (var j in scope.listBindToSound[i])
							scope.soundObjects[i][j] = scope.listBindToSound[i][j].name;
						// scope.soundObjects[i] = scope.listBindToSound[i];
					}
				}

				scope.play = function(i, j) {
					doobio.playInline(null, {url: scope.listBindToSound[i][j].url});
				}

				scope.load = function() {

					var soundPromise = scope.loadSoundCategoryList();
					// scope.soundList = loadSoundList();
					soundPromise.then(function(list){
						scope.soundList = list[0];
						scope.listBindToSound = list[1];

					});
				}
				
				scope.addSound = function(i, j){

					doobio.instances[scope.instanceName].sound({
						name: scope.listBindToSound[scope.soundList.indexOf(i)][j].name,
						url: scope.listBindToSound[scope.soundList.indexOf(i)][j].url
					}, true);
				};
			}
		}
	}]);
});