define(['controllers/controllers'], 
function(controllers){
	
	controllers.controller('SoundPatternsCtrl', [
		'$scope', '$rootScope', 'doobio', '$routeParams', '$location', 'auth', 'patterns', 'me',
		function ($scope, $rootScope, doobio, $routeParams, $location, auth, patterns, me) { //, loaded) {

	
		$("#topnav").slideDown(200);
		$("#btmerrmsg").hide();
		$("#btmloaderimg").hide();	

		var p = {}, found = false;
		$scope.instanceName = null;
		$scope.pattern = null;
		$scope.patternInfo = null;
		$scope.sounds = [];
		$scope.mappings = $scope.mappings || {};
		
		$scope.patterns = patterns;

		var me = me();

		me.then(function(me){
			$scope.$emit('me:done', me);
		});

			
		for (var i in $scope.patterns) {

			/** a simple object mapper improving pattern's accessability throughout the module */
			$scope.mappings[$scope.patterns[i]._id] = $scope.patterns[i];
			
			if (doobio.instanceNames.indexOf($rootScope.username) == -1)
				doobio.create($rootScope.username);

			$scope.sounds = doobio.get($rootScope.username) ? doobio.get($rootScope.username).sounds : null;
		}

		/** if an id is provided for the pattern */
		if ($routeParams.id) {

			/** find the pattern in local doob instances and display it */
			if ($routeParams.id in $scope.mappings) {
				$scope.instanceName = $scope.mappings[$routeParams.id].username;
				$scope.patternInfo = $scope.mappings[$routeParams.id];
				// $scope.pattern = $scope.mappings[$routeParams.id].content;
				$scope.pattern = doobio.instances[$scope.instanceName].env.ids[$routeParams.id]
				// $scope.pattern['id'] = $routeParams.id;
				// $scope.pattern['name'] = $scope.mappings[$tctrouteParams.id].name;
			}

			/** if the pattern is present in the local instances, fetch it from the server
			* and display it. */
			else {
				console.log('shiiiiiit')
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
			doobio.instances[soundInstanceName].env.assets[$scope.patternInfo.name].newTrack(sound, true);

			if ($scope.$$phase != '$apply' && $scope.$$phase != '$digest')
				$scope.$apply();
		}
		
		$scope.play = function(p, flag){
			doobio.instances[$scope.instanceName].env.assets[p.name].tempo = p.tempo
			doobio.instances[$scope.instanceName].env.assets[p.name].steps = p.steps
			doobio.instances[$scope.instanceName].env.assets[p.name].play(flag);
			console.log(doobio.instances[$scope.instanceName].env.assets[p.name]);
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

			// console.log()

			// if ($routeParams.id == soundPattern.id) {
			// }
			// else
				$scope.pattern = soundPattern;
				
				$scope.instanceName = instanceName;

				$scope.patternInfo = $scope.mappings[soundPattern.id];

				// $location.path('/sound-patterns/'+instanceName+'/'+soundPattern.id);

				if ($scope.$$phase != '$apply' && $scope.$$phase != '$digest')
				$scope.$apply();
		}

		$scope.remove = function(p, i) {
			doobio.instances[i].env.removeAsset(p.name, p.id, true);
			delete $scope.doob.get(i).soundPatterns[p.name];
		}
		
	}]);
});