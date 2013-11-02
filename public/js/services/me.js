define(['services/services'], function(services){

	services.factory('me', ['auth', '$location', '$rootScope', 'doobio', '$q', 
		'$timeout', '$route', 
		function(auth, $location, $rootScope, doobio, $q, $timeout, $route) {
			return function() {

				var delay = $q.defer();

				var promise = auth.authenticate();

				// delay.reject();

				function success() {

					if ($rootScope.me) 
						return delay.resolve($rootScope.me);

					var temp;
					var _me = auth.me();

					_me.then(function(data){
						$rootScope.username = data.username;
						if (!doobio.get($rootScope.username) && $rootScope.username) {
							doobio.create($rootScope.username);
						}
						temp = data;
						temp._patterns = {};
						temp._followers = {};
						temp._following = {};

						for (var i in temp.followers)
							temp._followers[temp.followers[i].username] = temp.followers[i];

						for (var i in temp.following)
							temp._following[temp.following[i].username] = temp.following[i];

						delay.resolve(temp);

					}, function(er, status){
						
						// p = auth.authenticate();
						// p.then
						if (status == 401) {
							$http.post('/login').success(function(){
								success();
							}).error(function(){
								delay.reject('We couldn`t load your data from server! Please reload the page.');
							});
						}
						else
							delay.reject('We couldn`t load your data from server! Please reload the page.');
					});

				}

				function failure () {
					delay.reject('Failed to authenticate you!');
					$location.path('/login');
				}

				promise.then(success, failure);

				return delay.promise;
			}
		}]); 
});