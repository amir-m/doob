define(['services/services'], function(services){
	
	services.factory('PatternsLoader', ['$http', '$q', '$route', '$rootScope', 
		'doobio', 'auth', '$location',
		function ($http, $q, $route, $rootScope, doobio, auth, $location) {
		return function() {

			var delay = $q.defer(), user; 

			// delay.reject('We couldn`t fetch sound patterns of ' + user + '!');			

			var authenticateUser = auth.authenticate();

			authenticateUser.then(fetch, authFailed);

			function fetch() {
				
				user = $route.current.params.user || $rootScope.username;

				if (!$route.current.params.id) {

					$http.get('/pattern/' + user)
					.success(fetchSucceed)
					.error(function(err, status) {
						if (status == 404) 
							delay.reject('We couldn`t find ' + user + '!');
						else
							delay.reject('We couldn`t fetch sound patterns of ' + user + '!');
					});
				}
				else {
					$http.get('/pattern/' + user + '/' +$route.current.params.id)
					.success(fetchSucceed)
					.error(function(err, status) {
						delay.reject('We couldn`t fetch the pattern!');							
					});
				}
			};

			function authFailed() {
				delay.reject('We couldn`t authenticate you!');
				console.log('PatternsLoader: authFailed: We couldn`t authenticate you!');
				$location.path('/login');
			};

			function fetchSucceed(patterns) {

				if (!$route.current.params.id) {

					var p = {};

					if (!doobio.instances[user]) 
							doobio.create(user);

					for (var i in patterns) {
						if (!doobio.instances[patterns[i].username]) 
							doobio.create(patterns[i].username);

						if (doobio.instances[patterns[i].username].env.assets[patterns[i].name])
							delete doobio.instances[patterns[i].username].env.assets[patterns[i].name];
						

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
							new doobio.instances[patterns[i].username].sequencer.SoundPattern(p, false);

					}	

					// console.log(patterns)
					
					delay.resolve(patterns);
				}
				else {
					
					if (angular.equals(patterns, []))
						return delay.reject("We couldn`t find the pattern you asked for!");

					pattern = patterns[0];
					var p = {};

					/** if there's no local instance for the pattern owner, create a doob for it */	
					if (pattern.username && doobio.instanceNames.indexOf($rootScope.username) == -1)
						doobio.create(pattern.username);

					for (var j in pattern.content.tracks) {

						if (!doobio.instances[pattern.username].env.assets[pattern.content.tracks[j].name])
							new doobio.instances[pattern.username].audio.Sound({
								name: pattern.content.tracks[j].name,
								url: pattern.content.tracks[j].url
							});
						
					}
					for (var j in pattern.content)
						p[j] = pattern.content[j];
						p['name'] = pattern.name;
						p['id'] = pattern._id;
					
					if (!doobio.instances[pattern.username].env.assets[pattern.name])
						pattern = new doobio.instances[pattern.username].sequencer.SoundPattern(p, false);

					delay.resolve(patterns);
				}
			};

			return delay.promise;
		}
	}]);
});