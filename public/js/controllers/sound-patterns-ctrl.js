define(['controllers/controllers'], 
function(controllers){
	
	controllers.controller('sound-patterns-ctrl', ['$scope', '$location', '$rootScope', 
		'socket', '$q', 'doobio', 'patterns', '$routeParams', //'loaded', 
		function ($scope, $location, $rootScope, socket, $q, doobio, patterns, $routeParams) { //, loaded) {
		// console.log($scope.$id);
		// console.log($scope.doob.sounds);
		// if (!$rootScope.username) {
		// 	var promise
			
		// }
		$scope.patterns = patterns;
		
		var p = {};

		console.log($routeParams)
				
		// for (var i in $scope.patterns) {
		// 	if (!doobio.instances[$scope.patterns[i].username]) 
		// 		doobio.create($scope.patterns[i].username);
		// 	for (var j in $scope.patterns[i].content.tracks) {

		// 		new doobio.instances[$scope.patterns[i].username].audio.Sound({
		// 			name: $scope.patterns[i].content.tracks[j].name,
		// 			url: $scope.patterns[i].content.tracks[j].url
		// 		});
				
		// 	}
		// 	for (var j in $scope.patterns[i].content)
		// 		p[j] = $scope.patterns[i].content[j];
		// 	p['name'] = $scope.patterns[i].name;
		// 	p['id'] = $scope.patterns[i]._id;
			
		// 	new doobio.instances[$scope.patterns[i].username].sequencer.SoundPattern(p);

		// }

		// $scope.loaded = loaded;

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

			// $location.path('/sound-patterns/'+instanceName+'/'+soundPattern.id);
		}
		$scope.remove = function(p, i) {
			doobio.instances[i].env.removeAsset(p.name, p.id);
			delete $scope.doob.get(i).soundPatterns[p.name];
		}
		
	}]);
});