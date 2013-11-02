define(['services/services'], function(services){
	
	services.factory('UserLoader', [
	'$http', '$q', '$route', 'me', '$rootScope',
	function ($http, $q, $route, me, $rootScope) {
		return function() {

			var delay = $q.defer();
				
			var promise = me();
			var user;

			promise.then(function(m){
				$rootScope.$broadcast("me:done", m);
				$http.get('/user/' + $route.current.params.user)
				.success(function(user) {
					// console.log(user);
					delay.resolve(user);
				}).error(function(err) {
					delay.reject(err);
				});
				
			}, function(err){
				delay.reject(err)
			})
			

			return delay.promise;
		}
	}]);
});