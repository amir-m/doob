define(['services/services'], function(services){
	
	services.factory('PatternLoader', ['$http', '$q', '$route', '$rootScope',
		function ($http, $q, $route, $rootScope) {
		return function() {
			
			var delay = $q.defer(), user = $route.current.params.user, 
				id = $route.current.params.id;			
				// console.log(id);
			$http.get('/pattern/' + user + '/' +id)
			.success(function(pattern) {
				delay.resolve(pattern);
			}).error(function(err) {
				delay.reject(err);
			});

			return delay.promise;
		}
	}]);
});