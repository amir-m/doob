define(['services/services'], function(services){
	
	services.factory('PatternLoader', ['$http', '$q', '$route', '$rootScope', 'doobio',
		function ($http, $q, $route, $rootScope, doobio) {
		return function() {
			
			/** get the username and id of the sound pattern from the route variable */
			var delay = $q.defer(), user = $route.current.params.user, 
				id = $route.current.params.id;			
				// console.log(id);

			/** get the pattern from the server */	
			$http.get('/pattern/' + user + '/' +id)
			.success(function(pattern) {

				/** if there's no local instance for the pattern owner, create a doob for it */	
				if (pattern.username && doobio.instanceName.indexOf($rootScope.username) == -1)
					doobio.create(pattern.username);

				for (var j in patterns[0].content.tracks) {

					if (!doobio.instances[patterns[0].username].env.assets[patterns[0].content.tracks[j].name])
						new doobio.instances[patterns[0].username].audio.Sound({
							name: patterns[0].content.tracks[j].name,
							url: patterns[0].content.tracks[j].url
						});
					
				}
				for (var j in patterns[0].content)
					p[j] = patterns[0].content[j];
				p['name'] = patterns[0].name;
				p['id'] = patterns[0]._id;
				
				if (!doobio.instances[patterns[0].username].env.assets[patterns[0].name])
					pattern = new doobio.instances[patterns[0].username].sequencer.SoundPattern(p, false);

				console.log(pattern)


				delay.resolve(pattern);
			}).error(function(err) {
				delay.reject(err);
			});

			return delay.promise;
		}
	}]);
});