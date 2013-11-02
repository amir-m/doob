define(['controllers/controllers'], 
function(controllers){
	
	controllers.controller('SoundPatternsCtrl', [
		'$scope', '$rootScope', 'doobio', '$routeParams', 
		'$location', 'auth', 'patterns', 'me', '$compile', 'socket', '$http', 
		function ($scope, $rootScope, doobio, $routeParams, 
		$location, auth, patterns, me, $compile, socket, $http) { 

		socket.on('new:soundPattern:comment', handlePatternIncommingData);
		socket.on('new:soundPattern:like', handlePatternIncommingData);
		socket.on('new:soundPattern:fork', handlePatternIncommingData);

		function handlePatternIncommingData (message) {
			if (message.broadcaster == $rootScope.username ||!message.data.resource || 
			!$scope.mappings[message.data.resource]) return;
			var event = message.event;
			var sub = event.split(":");
			sub = sub[sub.length - 1];

			switch (sub) {
				
				case ("comment"): 
					
					$scope.mappings[message.data.resource].comments.push({
						commenter: message.data.commenter,
						timestamp: message.timestamp,
						comment: message.data.comment,
						_id: message.data._id
					});

					if ($scope.$$phase != "$apply" && $scope.$$phase != "$digest")
						$scope.$apply();

					break;

				case ("like"): 
					
					if (!$scope.mappings[message.data.resource].likesCount)
						$scope.mappings[message.data.resource].likesCount = 1;
					else 
						$scope.mappings[message.data.resource].likesCount++;
					
					if ($scope.$$phase != "$apply" && $scope.$$phase != "$digest")
						$scope.$apply();

					break;

				case ("fork"): 
					
					if (!$scope.mappings[message.data.resource].forksCount)
						$scope.mappings[message.data.resource].forksCount = 1;
					else 
						$scope.mappings[message.data.resource].forksCount++;
					
					if ($scope.$$phase != "$apply" && $scope.$$phase != "$digest")
						$scope.$apply();

					break;
			}
		}
	
		$("#topnav").slideDown(200);
		$("#btmerrmsg").hide();
		$("#btmloaderimg").hide();	

		var p = {}, found = false;
		$scope.instanceName = null;
		$scope.pattern = null;
		$scope.patternInfo = null;
		$scope.sounds = [];
		$scope.mappings = $scope.mappings || {};
		$scope.openPatterns = {};
		$scope.openPattern = false;
		
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
				$scope.pattern = $scope.mappings[$routeParams.id].content;
				$scope.pattern = doobio.instances[$scope.instanceName].env.ids[$routeParams.id]
				$scope.pattern['id'] = $routeParams.id;
				$scope.pattern['name'] = $scope.mappings[$tctrouteParams.id].name;
			}

			/** if the pattern is present in the local instances, fetch it from the server
			* and display it. */
			else {
				var promise = PatternLoader();
				promise.then(function(pattern){
					$scope.viewEdit(pattern[0], pattern[0].username)
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
		}; 

		

		$scope.loadedOpenPatterns = function () {
			console.log($scope.openPatterns)
		}; 

		$scope.allowDrop = function (ev) {
			ev.preventDefault();
		};
		$scope.drag = function (sound, instanceName) {
			$scope.addSoundToPattern(sound, instanceName)
		};
		

		$scope.showPattern = function() {

			return $scope.openPattern;
		}

		$scope.closePattern = function(pattern) {
			var id = pattern._id ? pattern._id : pattern.id;
			$('#' + id).remove();
			delete $scope.openPatterns[id];

			socket.emit("leave", {
				event: "leave",
				broadcaster: $rootScope.username,
				room: id,
				timestamp: new Date().getTime()
			});

		}

		$scope.viewEdit = function(soundPattern, instanceName) {

			if (soundPattern.id in $scope.openPatterns) {
				
				$('html, body').animate({
					scrollTop: $("#"+soundPattern.id).offset().top - 50
				}, 200);
				return;
			}

			var html = "<sound-pattern id='"+soundPattern.id+"'></sound-pattern>";
			var scope = $scope.$new();

			scope.pattern = soundPattern;
				
			scope.instanceName = instanceName;

			scope.patternInfo = $scope.mappings[soundPattern.id];


			/*
			*	append this pattern to the current sound patterns
			*/
			$('#soundpatterns').append($compile(html)(scope));
			$('html, body').animate({
				scrollTop: $("#"+soundPattern.id).offset().top - 55
			}, 200);

			$scope.openPatterns[soundPattern.id] = soundPattern;
			$scope.openPattern = true;

			socket.emit("join", {
				event: "join",
				broadcaster: $rootScope.username,
				room: soundPattern.id,
				timestamp: new Date().getTime()
			});

			if ($scope.$$phase != '$apply' && $scope.$$phase != '$digest')
				$scope.$apply();

			if (!$scope.mappings[soundPattern.id].iLikeIt) {

				$http.get('/me?like='+soundPattern.id).success(function (data) {
					console.log(data);
					$scope.mappings[soundPattern.id].iLikeIt = data.like;
				}).error(function (error, status) {
					console.log(error);
					console.log(status);
				});

			}
			
			if (!$scope.mappings[soundPattern.id]) return;

			if (!$scope.mappings[soundPattern.id].iLikeIt || 
				!$scope.mappings[soundPattern.id].iForkedIt) {
				$http.get('/me?likefork='+soundPattern.id).success(function (data) {
					$scope.mappings[soundPattern.id].iLikeIt = data.like;
					$scope.mappings[soundPattern.id].iForkedIt = data.forked;
				}).error(function (error, status) {
					console.log(error);
					console.log(status);
				});
			}
		}

		$scope.remove = function(p, i) {
			
			if ($scope.openPatterns[p.id]) $scope.closePattern($scope.mappings[p.id]);
			doobio.instances[i].env.removeAsset(p.name, p.id, true);
			delete $scope.doob.get(i).soundPatterns[p.name];

			socket.emit("remove:sequencer:SoundPattern", {
				event: "remove:sequencer:SoundPattern",
				broadcaster: $rootScope.username,
				subscriber: $rootScope.username,
				timestamp: new Date().getTime(),
				message: {
					id: p.id,
					name: p.name
				}
			})
		};

		$scope.playAll = function() {
			
			$scope.stopAll();

			for (var i in $scope.openPatterns)
				$scope.openPatterns[i].play();
		};

		$scope.stopAll = function() {
			
			for (var i in $scope.openPatterns)
				$scope.openPatterns[i].stop();
		};

		$scope.loopAll = function() {
			
			$scope.stopAll();

			for (var i in $scope.openPatterns)
				$scope.openPatterns[i].play(1);
		};
		
	}]);
});