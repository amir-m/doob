angular.module('hm', []).factory('Auth', ['$http', '$location', function($http, $location){
	var me = null;
	var getMe = function() {
		$http.get('/me').success(function(data, status){
			if (status == 404) {
				console.log('already expired dude!!');
				me = null;
				$location.path('/login');
			}
			else {
				me = JSON.parse(data);
				console.log(me);
			}
		});
	}
	return {
		login: function(u, p){
			if (me) $location.path('/home');
			$http({
				method: 'POST',
				data: {
					'username': u,
					'password': p
				},
				headers: {
					'Content-Type': 'application/json'
				},
				url: '/login'
			}).success(function(res) {
				getMe(function(res){
					me = res;
					$location.path('/home');
				});
			});
		},
		register: function(u, p){
			if (me) $location.path('/home');
			$http({
				method: 'POST',
				data: {
					'username': u,
					'password': p
				},
				headers: {
					'Content-Type': 'application/json'
				},
				url: '/register'
			}).success(function(res) {
				getMe(function(res){
					me = res;
					$location.path('/home');
				});
			});
		},
		logout: function(){
			$http.get('/logout').success(function(res) {
				me = null;
				$location.path('/login')
			});
		},
		me: me
	};
}]).config(['$routeProvider', function($routeProvider) {
  $routeProvider.
      when('/login', {templateUrl: 'partials/login.html', controller: LoginCtrl}).
      when('/home', {templateUrl: 'partials/index.html', controller: HomeCtrl}).
      // when('/register', {templateUrl: 'views/register.html', controller: RegisterCtrl}).
      otherwise({redirectTo: '/home'});
}]);