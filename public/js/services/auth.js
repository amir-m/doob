define(['services/services'], function(services){

	services.factory('auth',  ['$rootScope', '$http', '$location', '$q', 'socket', '$cookies', 'doobio',
			function ($rootScope, $http, $location, $q, socket, $cookies, doobio){
			// socket.disconnect(false);

		    function _getMe (param) {

		        var delay = $q.defer();
		        var param = param || {};

		        // for (var i in param)
		        // 	if ($cookies[param[i]]) delay.resolve($cookies[param[i]]);
			    
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

		    		delay.resolve(res.username);

		    	}).error(function(error, status){
		    		delay.reject();
		    	});	

		    	return delay.promise;
		    };

		    var authenticate = function() {

		    	var delay = $q.defer();

		   		$http.get('/ping').success(function() {

		   			socket.connect(true);
		 
		   			// Scenario 1 - 2.b
		   			if (!$rootScope.username) {
		   				if ($cookies.username) {
		   					$rootScope.username = $cookies.username;
		   					delay.resolve();
		   				}
			   			// Scenario 1 - 2.a
			   			else {
			   				var promise = _getMe({'username': 1});

			   				promise.then(function(data){
			   					$rootScope.username = data.username;
			   					$cookies.username = data.username;
			   					// $location.path(path);
			   					delay.resolve();
			   				});
			   			}
		   			}

		   		}).error(function(data, status) {

		   			if (status == 401) {
			   			socket.disconnect(false);
			   			$rootScope.username = null;
			   			$cookies.username = null;

		   				if ($cookies.s) {
		   					
			   				var promise = _login();

			   				promise.then(function(username){
			   					// success
			   					socket.connect(true);
			   					$rootScope.username = username;
			   					$cookies.username = username;
			   					// $location.path(path);
			   					delay.resolve();
			   				}, function(){
			   					// error
								// $location.path('/login');
								delay.reject();
			   				});
		   				}
		   				else {
		   					// $location.path('/login');
		   					delay.reject();
		   				}
		   			}
		   		});

		   		return delay.promise;
		    };

		    var login = function(u, p, rememberMe, callback){
		    	
		    	
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
		    		$location.path('/home');

		    		if (callback) return callback(status);

		    	}).error(function(error, status){
		    		console.log('error')
		    		if (callback) return callback(status);
		    	});		   
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
		    		console.log(error)
		    		if (status == 400 && callback) return callback(status);
		    	});;
		    };

		    var logout = function(scope){
	            // $location.path('/login');

	            $http.post('/logout').success(function(res) {

	            	$cookies.username = null;
	            	$rootScope.username = null;
	            	doobio.instances = [];
	            	doobio.instanceNames = [];
	            	$location.path('/login');

	            }).error(function(){
	            	console.log('logout: error');
	            	$cookies.username = null;
	            	$rootScope.username = null;
	            	$location.path('/login');
	            });
	            
	            // $rootScope.$digest();
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