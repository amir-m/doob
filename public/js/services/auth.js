define(['services/services'], function(services){

	services.factory('auth',  ['$rootScope', '$http', '$location', '$q', 'socket', '$cookies',
			function ($rootScope, $http, $location, $q, socket, $cookies){
			// socket.disconnect(false);
		    var myInfo = {};

		    function _getMe (param) {
		        
		        var delay = $q.defer();

		        $http({
		            cache: false,
		            method: 'POST',
		            headers: {
		                'Content-Type': 'application/json'
		            },
		            url: '/me'
		        }).success(function(data, status, headers){
		            myInfo = data;
		            
		            if (data[param]) delay.resolve(data[param]);
		            else delay.resolve(data);
		            

		        }).error(function(data, status, headers){
		            myInfo = null;
		            delay.reject();
		        });

		        return delay.promise;
		    }

		    var _login = function() {

		    	var delay = $q.defer();

		    	$http.post('/login').success(function(res, status) {

		    		
		    		var promise = _getMe('username');

	   				promise.then(function(username){
		    			delay.resolve(username);
	   				}, function(){
	   					console.log('error');
	   					delay.reject();
	   				});



		    	}).error(function(error, status){
		    		delay.reject();
		    	});	

		    	return delay.promise;
		    };

		    var authenticate = function(path) {

		   		$http.get('/ping').success(function() {

		   			socket.connect(true);
		   			
		   			// Scenario 1 - 2.b
		   			if ($cookies.username) {
		   				$rootScope.username = $cookies.username;
		   				$location.path(path);
		   			}
		   			// Scenario 1 - 2.a
		   			else {
		   				var promise = _getMe('username');

		   				promise.then(function(username){
		   					$rootScope.username = username;
		   					$cookies.username = username;
		   					$location.path(path);
		   				});
		   			}

		   		}).error(function(data, status) {

		   			if (status == 401) {
			   			socket.disconnect(false);
			   			$rootScope.username = null;
			   			$cookies.username = null;
			   			
			   			// login(null, null, null, function(status){
			   				
			   			// 	if (status == 200) {
			   			// 		var promise = _getMe('username');

				   		// 		promise.then(function(username){
				   		// 			$rootScope.username = username;
				   		// 			$cookies.username = username;
				   		// 			$location.path(path);
				   		// 		});
			   			// 	}
			   			// 	else $location.path('/login');
			   			// });

		   				var promise = _login();

		   				promise.then(function(username){
		   					// success
		   					socket.connect(true);
		   					$rootScope.username = username;
		   					$cookies.username = username;
		   					$location.path(path);
		   				}, function(){
		   					// error
							$location.path('/login');
		   				});
		   			}
		   		});
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
		    	}).success(function(res, status) {
		    		console.log('success')
		    		socket.connect(true);
		    		$rootScope.username = u;
		    		$cookies.username = u;
		    		// myInfo.username = u;
		    		// myInfo.rememberMe = rememberMe;
		    		$location.path('/home');

		    		if (callback) return callback(status);

		    	}).error(function(error, status){
		    		console.log('error')
		    		if (callback) return callback(status);
		    	});		   
		    };

		    var register = function(u, p, rememberMe, callback){
		    	if (myInfo) myInfo = {};
		    	$http({
		    		method: 'POST',
		    		data: {
		    			'username': u,
		    			'password': p,
		    			'rememberMe': rememberMe
		    		},
		    		headers: {
		    			'Content-Type': 'application/json'
		    		},
		    		url: '/register'
		    	}).success(function(res) {
		    		socket.connect(true);
		    		$rootScope.username = u;
		    		myInfo.username = u;
		    		myInfo.rememberMe = rememberMe;
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
	            console.log(scope.$$phase)

	            	$cookies.username = null;
	            	$rootScope.username = null;
	            	myInfo = {};
	            	$location.path('/login');

	            }).error(function(){
	            	console.log('logout: error');
	            	$cookies.username = null;
	            	$rootScope.username = null;
	            	myInfo = {};
	            	$location.path('/login');
	            });
	            
	            // $rootScope.$digest();
	        };

	        var destroy = function(){
	        	$cookies.username = null;
	        	$http({
		            cache: false,
		            method: 'POST',
		            url: '/destroy'
		        });
	        }

	    return {
	    	authenticate: authenticate,
	    	login: login,
	    	logout: logout,
	    	register: register,
	    	destroy: destroy
	    }
	}]);
});