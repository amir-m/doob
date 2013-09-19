define(['services/services'], function(services){

	services.factory('SettingsLoader', 
	['$q', '$http', 'me', 
	function ($q, $http, me) {
		
		return function() {

			var delay = $q.defer();

			var promise = me();

			promise.then(function(){

				$http.get('/settings', {
					cache: false
				}).success(function(data, status){
					delay.resolve(data);
				}).error(function(data, status){
					delay.reject(data);
				});
				
			}, function(r){
				delay.reject(r);
			});


			return delay.promise;
		};
	}]); 
});