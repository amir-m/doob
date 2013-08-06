angular.module('hm', []).factory('Auth', ['$http', '$location', function($http, $location){
	var myInfo = null;
	function getMe (callback) {
		// $http.get('/me', {headers: {'Content-Type': 'application/json'}}).
		$http({
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				},
				url: '/me'
		}).success(function(data, status, headers){
			if (status == 404) {
				console.log('already expired dude!!');
				myInfo = null;
				if (callback) callback();
			}
			else {
				myInfo = data;
				if (callback) callback(myInfo);
			}
		});
	}
	getMe();
	return {
		login: function(u, p, callback){
			if (myInfo) return $location.path('/home');
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
			}).success(function(res, status) {
				if (status == 401) 
					if (callback) return callback(status);
					else return;
				getMe(function(){
					$location.path('/home');	
				});
			}).error(function(error, status){
				if (status == 401) 
					if (callback) return callback(status);
					else return;
			});
		},
		register: function(u, p, callback){
			if (myInfo) return $location.path('/home');
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
				getMe(function(){
					$location.path('/home');	
				});
			}).error(function(error, status){
				if (status == 400) 
					if (callback) return callback(status);
					else return;
			});;
		},
		logout: function(){
			$http.get('/logout').success(function(res) {
				myInfo = null;
				$location.path('/login')
			});
		},
		get me() {
			return myInfo;
		},
		get username() {
			return myInfo ? myInfo['username'] : null;
		}
	};
}]).config(['$routeProvider', function($routeProvider) {
  $routeProvider.
      when('/login', {templateUrl: 'partials/login.html', controller: LoginCtrl}).
      when('/home', {templateUrl: 'partials/index.html', controller: HomeCtrl}).
      when('/me', {templateUrl: 'partials/me.html', controller: HomeCtrl}).
      // when('/register', {templateUrl: 'views/register.html', controller: RegisterCtrl}).
      otherwise({redirectTo: '/home'});
}]);