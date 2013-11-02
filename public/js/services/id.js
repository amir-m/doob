define(['services/services'], function(services){

	services.factory('idService', 
	['auth', '$q', '$http',
	function(auth, $q, $http) {
			return function(count) {

				var delay = $q.defer(), count = count || 1;
				
				var promise = auth.authenticate();
				promise.then(success, failure);

				if (isNaN(count) || count < 1) delay.reject();

				function success() {
					$http.get('/id?count='+count).success(function (ids) {
						delay.resolve(ids);

					}).error(function(){

						delay.reject();

					});
				}

				function failure () {
					console.log(arguments)
					delay.reject('Failed to authenticate you!');
				}

				return delay.promise;
			}
		}]); 
});