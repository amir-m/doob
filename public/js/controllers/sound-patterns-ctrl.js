define(['controllers/controllers'], 
function(controllers){
	
	controllers.controller('sound-patterns-ctrl', [
				 '$scope', '$rootScope', 'doobio', 'patterns', '$routeParams', 'PatternLoader', '$location', 
		function ($scope, $rootScope, doobio, patterns, $routeParams, PatternLoader, $location) { //, loaded) {
		

		$scope.patterns = $scope.patterns || patterns;

		var p = {}, found = false;
		$scope.instanceName = null;
		$scope.pattern = null;
		$scope.patternInfo = null;
		$scope.sounds = [];
		$scope.mappings = $scope.mappings || {};

		/** a simple object mapper improving pattern's accessability throughout the module */
		for (var i in patterns) {
			$scope.mappings[patterns[i]._id] = patterns[i];
		}

		/** if an id is provided for the pattern */
		if ($routeParams.id) {
			/** find the pattern in local doob instances and display it */
			// for (var ins in doobio.instances) {
			// 	if (doobio.instances[ins].env.assets[$routeParams.id]) {
			// 		$scope.instanceName = ins;
			// 		$scope.pattern = doobio.instances[ins].env.assets[$routeParams.id];

			// 		$scope.instanceName = pattern[0].username;
			// 		$scope.patternInfo = pattern[0];
			// 		$scope.pattern = pattern[0].content;
			// 		found = true;
			// 		break;
			// 	}
			// }
			if ($routeParams.id in $scope.mappings) {
				$scope.instanceName = $scope.mappings[$routeParams.id].username;
				$scope.patternInfo = $scope.mappings[$routeParams.id];
				$scope.pattern = $scope.mappings[$routeParams.id].content;
				$scope.pattern['id'] = $routeParams.id;
				$scope.pattern['name'] = $scope.mappings[$routeParams.id].name;
			}

			/** if the pattern is present in the local instances, fetch it from the server
			* and display it.
			*/
			else {
				var promise = PatternLoader();
				promise.then(function(pattern){
					// $scope.viewEdit(pattern[0], pattern[0].username)
					$scope.instanceName = pattern[0].username;
					$scope.patternInfo = pattern[0];
					$scope.pattern = pattern[0].content;
					$scope.pattern['id'] = pattern[0]._id;
					$scope.pattern['name'] = pattern[0].name;
					found = true;					
				});
			}
		}

		$scope.doob = doobio;

				
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

		if (doobio.instanceNames.indexOf($rootScope.username) == -1)
			doobio.create($rootScope.username);

		$scope.sounds = doobio.get($rootScope.username) ? doobio.get($rootScope.username).sounds : null;

		$scope.addSoundToPattern = function(sound, soundInstanceName) {
			
			// console.log('sound: %s, instanceName: %s, $scope.pattern: %s, $scope.instanceName', 
			// 	sound, soundInstanceName, $scope.pattern.name, $scope.instanceName);
			if (!doobio.instances[$scope.instanceName].env.assets[sound]) {
				new doobio.instances[$scope.instanceName].audio.Sound({
					name: sound,
					url: doobio.instances[soundInstanceName].env.assets[sound].url
				}, true);
			}
			$scope.patternInfo.updated = new Date().getTime();
			doobio.instances[$scope.instanceName].env.assets[$scope.patternInfo.name].newTrack(sound, true);
		}

		// $scope.ready = function() {
		// 	var defered = $q.defer();

		// 	$scope.loadDoobInstance(function(error){

		// 		if (error) defered.reject(error);
				
		// 		else { 
		// 			defered.resolve();
		// 		};
		// 	});
		// 	return defered.promise;
		// }

		// var t = $scope.ready();

		// t.then(function(){
			
		// }, function(error){
		// 	console.log(error);
		// });
		

		$scope.play = function(p, flag){
			doobio.instances[$scope.instanceName].env.assets[p.name].play(flag);
		};

		$scope.stop = function(p, flag){
			doobio.instances[$scope.instanceName].env.assets[p.name].stop(flag);
		};

		$scope.showPattern = function() {
			return $scope.pattern != null
		}

		$scope.closePattern = function() {
			$scope.instanceName = null;
			$scope.pattern = null;
			$scope.patternInfo = null;
		}

		$scope.viewEdit = function(soundPattern, instanceName) {

			if ($routeParams.id == soundPattern.id) {
				$scope.pattern = soundPattern;
				
				$scope.instanceName = instanceName;

				$scope.patternInfo = $scope.mappings[soundPattern.id];
			}
			else

				$location.path('/sound-patterns/'+instanceName+'/'+soundPattern.id);
		}

		$scope.remove = function(p, i) {
			doobio.instances[i].env.removeAsset(p.name, p.id, true);
			delete $scope.doob.get(i).soundPatterns[p.name];
		}
		
	}]);
});