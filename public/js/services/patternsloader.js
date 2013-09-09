define(['services/services'], function(services){
	
	services.factory('PatternsLoader', ['$http', '$q', '$route', '$rootScope', 'doobio',
		function ($http, $q, $route, $rootScope, doobio) {
		return function() {
			
			var delay = $q.defer(), user = $route.current.params.user || $rootScope.username;			

			// if (doobio.instances[user]) delay.resolve(doobio.)

			$http.get('/pattern/' + user)
			.success(function(patterns) {

				var p = {};

				for (var i in patterns) {
					if (!doobio.instances[patterns[i].username]) 
						doobio.create(patterns[i].username);
					for (var j in patterns[i].content.tracks) {

						if (!doobio.instances[patterns[i].username].env.assets[patterns[i].content.tracks[j].name])
							new doobio.instances[patterns[i].username].audio.Sound({
								name: patterns[i].content.tracks[j].name,
								url: patterns[i].content.tracks[j].url
							});
						
					}
					for (var j in patterns[i].content)
						p[j] = patterns[i].content[j];
					p['name'] = patterns[i].name;
					p['id'] = patterns[i]._id;
					
					if (!doobio.instances[patterns[i].username].env.assets[patterns[i].name])
						new doobio.instances[patterns[i].username].sequencer.SoundPattern(p);

				}	

				console.log(doobio.instances[patterns[i].username])


				delay.resolve(patterns);
			}).error(function(err) {
				delay.reject(err);
			});

			return delay.promise;
		}
	}]);
});