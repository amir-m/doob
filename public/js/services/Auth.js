define(['services/services'], function(services){

	services.factory('Auth',  ['$rootScope', '$http', '$location', '$q', 'socket', 
			function ($rootScope, $http, $location, $q, socket){
			// socket.disconnect(false);
		    var myInfo = {};
		    // function _getMe (callback) {
		    //     // $http.get('/me', {headers: {'Content-Type': 'application/json'}}).
		    //     $http({
		    //         cache: false,
		    //         method: 'GET',
		    //         headers: {
		    //             'Content-Type': 'application/json'
		    //         },
		    //         url: '/me'
		    //     }).success(function(data, status, headers){
		    //         myInfo = data;
		    //         if (callback) callback(myInfo);
		            
		    //         $rootScope.username = myInfo.username;
		            

		    //     }).error(function(data, status, headers){
		    //         myInfo = null;
		    //         callback(null);
		    //     });
		    // }

		    var authenticate = function() {
		        var delay = $q.defer();
		        // _getMe(function(me){
		        //     if (me) {
		        //     	socket.connect(true);
		        //     	delay.resolve(true);
		        //     }
		        //     else {
		        //     	socket.disconnect(false);
		        //     	delay.reject(false);
		        //     }
		        // });
		   	
		   		$http.get('/ping').success(function(){
		   			socket.connect(true);
		   			delay.resolve(true);
		   		}).error(function(){
		   			socket.disconnect(false);
		   			delay.reject(false);
		   		});
		        return delay.promise;
		    }
		    var auth = {
		        login: function(u, p, rememberMe, callback){
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
		            	socket.connect(true);
		            	$rootScope.username = u;
		            	myInfo.username = u;
		            	myInfo.rememberMe = rememberMe;
		            	$location.path('/home');
		            	if (callback) return callback(status);
		                
		            }).error(function(error, status){
		                if (callback) return callback(status);
		            });
		        },
		        register: function(u, p, rememberMe, callback){
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
		            		socket.connect(true);
		            		$rootScope.username = u;
		            		myInfo.username = u;
		            		myInfo.rememberMe = rememberMe;
		            		$location.path('/home');
		            		if (callback) return callback(res);
		                }).error(function(error, status){
		                    if (status == 400 && callback) return callback(status);
		                });;
		        },
		        logout: function(){
		            // $location.path('/login');
		            socket.disconnect(false);
		            $rootScope.username = null;
		            $http.get('/logout').success(function(res) {
		                myInfo = null;
		                $location.path('/login');
		            }).error(function(){
		                    $location.path('/login');
		                });
		        },
		        authenticate: authenticate,    
		        get username() {
		            return (myInfo && myInfo.username) ? myInfo.username : null;
		        }
		    };

		    return auth;
	}]);
});