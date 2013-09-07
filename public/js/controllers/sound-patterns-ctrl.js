define(['controllers/controllers', 'services/socket', 'services/doob', 'uiBootstrap'], 
function(controllers){
	
	controllers.controller('sound-patterns-ctrl', ['$scope', '$location', '$rootScope', 
		'socket', '$q', 'doobio', 
		function ($scope, $location, $rootScope, socket, $q, doobio) {
		// console.log($scope.$id);
		// console.log($scope.doob.sounds);
		// if (!$rootScope.username) {
		// 	var promise
			
		// }
		$scope.$on('doob', function(ev){
			// console.log('i captured this bitch!')
			// console.log(ev.targetScope)
		});

		$scope.instanceName = null;
		$scope.pattern = null;
		$scope.sounds = [];

		$scope.addSoundToPattern = function(sound, soundInstanceName) {
			
			// console.log('sound: %s, instanceName: %s, $scope.pattern: %s, $scope.instanceName', 
			// 	sound, soundInstanceName, $scope.pattern.name, $scope.instanceName);
			if (!doobio.instances[$scope.instanceName].env.assets[sound]) {
				new doobio.instances[$scope.instanceName].audio.Sound({
					name: sound,
					url: doobio.instances[soundInstanceName].env.assets[sound].url
				}, true);
			}
			doobio.instances[$scope.instanceName].env.assets[$scope.pattern.name].newTrack(sound, true);
		}

		$scope.ready = function() {
			var defered = $q.defer();
			$scope.loadDoobInstance(function(error){

				if (error) defered.reject(error);
				
				else { 
					defered.resolve();
				};
			});
			return defered.promise;
		}

		var t = $scope.ready();

		t.then(function(){
			$scope.sounds = $scope.doob.sounds;
		}, function(error){
			console.log(error);
		});
		

		// $scope.$watch($scope.doob.sounds, function(newVal, oldVal){
		// 	console.log(newVal)
		// 	$scope.sounds = newVal;
		// });

		$scope.showPattern = function() {
			return $scope.pattern != null
		}

		$scope.closePattern = function() {
			$scope.instanceName = null;
			$scope.pattern = null;
		}

		$scope.viewEdit = function(soundPattern, instanceName) {

			$scope.pattern = soundPattern;
			
			$scope.instanceName = instanceName;
		}
		
	}]);
});