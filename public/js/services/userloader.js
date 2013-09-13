define(['services/services'], function(services){
	
	services.factory('UserLoader', ['$http', '$q', '$route', 'me', function ($http, $q, $route, me) {
		return function() {

			var delay = $q.defer();
			
			
			
			$http.get('/user/' + $route.current.params.user)
			.success(function(user) {
				delay.resolve(user);
			}).error(function(err) {
				delay.reject(err);
			});

			return delay.promise;
		}
	}]);
});