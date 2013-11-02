define(['services/services'], function(services){

	services.factory('auth',  ['$rootScope', '$http', '$location', '$q', 
		'socket', '$cookies', 'doobio',
		function ($rootScope, $http, $location, $q, socket, $cookies, doobio){

		    function _getMe (param) {

		        var delay = $q.defer();
 		        var param = param || {};

		    	$http({
		    		cache: false,
		    		method: 'GET',
		    		params: param,
		    		headers: {
		    			'Content-Type': 'application/json'
		    		},
		    		url: '/me'
		    	}).success(function(data, status, headers){

		    		delay.resolve(data);

		    	}).error(function(data, status, headers){
		    		delay.reject(data, status);
		    	});
	       	
		       	return delay.promise;
		    }

		    var _login = function() {

		    	var delay = $q.defer();

		    	$http.post('/login').success(function(res, status) {

		    		if (res.username) delay.resolve(res.username);
		    		else delay.resolve();


		    	}).error(function(error, status) {
		    		delay.reject(error);
		    	});	

		    	return delay.promise;
		    };

		    var authenticate = function() {

		    	var delay = $q.defer();

	   			$http.get('/ping').success(function(data, status) {

	   				if (status == 200) {

			   			socket.connect(true);
			 
			   			if (!$rootScope.username) {
			   				
			   				if ($cookies.username) {

			   					$rootScope.username = $cookies.username;
			   					delay.resolve($rootScope.username);
			   				}
				   			// Scenario 1 - 2.a
				   			else {

				   				var promise = _getMe({'username': 1});

				   				promise.then(function(data){

				   					$rootScope.username = data.username;
				   					$cookies.username = data.username;
				   					delay.resolve($rootScope.username);
				   				}, function(error){
				   					delay.reject(error)
				   				});
				   			}
			   			}
			   			else
			   				delay.resolve($rootScope.username);
		   			}
		   			else if (status == 202) {
			   			socket.disconnect(false);
			   			$rootScope.username = null;
			   			$cookies.username = null;
		   				
		   				var promise = _login();

		   				promise.then(function(username){
		   					socket.connect(true);
		   					$rootScope.username = username;
		   					$cookies.username = username;
		   					delay.resolve($rootScope.username);
		   				}, function(error){
							delay.reject(error);
		   				});
		   			}
	   				else {
	   					delay.reject();
	   				}

		   		}).error(function(data, status) {

		   			delay.reject();

		   		});

		   		return delay.promise;
		    };

		    var login = function(u, p, rememberMe){
		    	
		    	var delay = $q.defer();
		    	
		    	var data = '';

		    	if (u && p && rememberMe) 
				    data = {
				    	'username': u,
				    	'password': p,
				    	'rememberMe': rememberMe
				    };

				else if (u && p)
					data = {
				    	'username': u,
				    	'password': p
				    };

			    $http({
		    		method: 'POST',
		    		data: data,
		    		headers: {
		    			'Content-Type': 'application/json'
		    		},
		    		url: '/login'
		    	}).success(function(res, status, headers) {
		    		
		    		socket.connect(true);
		    		$rootScope.username = u;
		    		$cookies.username = u;
		    		delay.resolve();

		    	}).error(function(error, status){
		    		delay.reject();
		    	});		

		    	return delay.promise;   
		    };

		    var register = function(u, p, e, rememberMe, callback){
		    	$http({
		    		method: 'POST',
		    		data: {
		    			'username': u,
		    			'password': p,
		    			'email': e,
		    			'rememberMe': rememberMe ? '1' : null
		    		},
		    		headers: {
		    			'Content-Type': 'application/json'
		    		},
		    		url: '/register'
		    	}).success(function(res) {
		    		socket.connect(true);
		    		$rootScope.username = u;
		    		$location.path('/home');
		    		if (callback) return callback(res);
		    	}).error(function(error, status){
		    		if (status == 400 && callback) return callback(status);
		    	});;
		    };

		    var logout = function(scope){

	            $http.post('/logout').success(function(res) {

	            	$cookies.username = null;
	            	$rootScope.username = null;
	            	doobio.instances = [];
	            	doobio.instanceNames = [];
	            	$location.path('/login');

	            }).error(function(){
	            	$cookies.username = null;
	            	$rootScope.username = null;
	            	$location.path('/login');
	            });
	            
	        };

	        var destroy = function(){
	        	$cookies.username = null;
	        	$http({
		            cache: false,
		            method: 'GET',
		            url: '/destroy'
		        });
	        }

	    var getSoundPatterns = function(){
	    	var delay = $q.defer();

	    	socket.emit('fetch:SoundPatterns:request', 
	    	{
	    		event: 'fetch:SoundPatterns:request',
	    		broadcaster: $rootScope.username,
	    		subscriber: $rootScope.username,
	    		timestamp: new Date().getTime()
	    	});

	    	socket.on('fetch:SoundPatterns:response', function(data){

	    		if (data.subscriber != $rootScope.username || data.broadcaster != 'sys') 
	    			delay.reject('Socket problem');

	    		delay.resolve(data.message['SoundPatterns']);

	    	});

	    	return delay.promise;
	    }

	    return {
	    	authenticate: authenticate,
	    	login: login,
	    	logout: logout,
	    	register: register,
	    	destroy: destroy,
	    	me: _getMe, 
	    	getSoundPatterns: getSoundPatterns
	    }
	}]);
});