define(['services/services'], function(services){

	services.factory('me', ['auth', '$location', '$rootScope', 'doobio', '$q'
		,function(auth, $location, $rootScope, doobio, $q) {
			return function() {
				var delay = $q.defer();

				var promise = auth.authenticate();

				function success() {
					var temp;
					var me = auth.me();

					me.then(function(data){
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


						$("#topnav").slideDown(200);

						delay.resolve(temp);


					}, function(er, status){
						console.log(er);
						console.log(status);
						delay.reject();
						$location.path('/login');
					});

				}

				function failure () {
					delay.reject();
					$location.path('/login');
				}

				promise.then(success, failure);

				return delay.promise;
			}
		}]); 
});