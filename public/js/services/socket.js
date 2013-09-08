define(['services/services'], function(services){
	
	services.factory('socket', function ($rootScope, $http, $q) {


		var flag = false;

	    var socket = io.connect('/', {reconnect: false, 'try multiple transports': false});


	    var get = function(){

	    	var delay = $q.defer();

	    	$http({
	            cache: false,
	            method: 'GET',	   
	            url: '/ping'
	        }).success(function(){
	    		delay.resolve(true);
	    	}).error(function(data, status){
	    		// maybe the session is timed out, try login
	    		if (status == 401) {

	    			$http.post('/login').success(function(res, status) {

		    			delay.resolve();

		    		}).error(function(error, status){
		    			console.log("error connecting to the server: %s", error);
		    			delay.reject();
		    		});
	    		}
	    	});

	    	return delay.promise;
	    }

	    var interval;
	    var reconnectCount = 0;
	    
	    socket.on('disconnect', function () {
	    	if (!flag) return;
	        console.log('disconnected from socket server...');
	        interval = setInterval(_reconnect, 5000);
	        
	        // safe apply
	        if ($rootScope.$$phase == '$apply' || $rootScope.$$phase == '$digest') {
	        	$rootScope.isConnected = false;
	        } 
	        else {
	        	$rootScope.$apply(function(){
	        		$rootScope.isConnected = false;
	        	});
	        }
	    });

	    socket.on('connect', function () {
	        console.log('connected to the socket server.');
	        
	        if ($rootScope.$$phase == '$apply' || $rootScope.$$phase == '$digest') {
	        	$rootScope.isConnected = true;
	        } 
	        else {
	        	$rootScope.$apply(function(){
	        		$rootScope.isConnected = true;
	        	});
	        }
	    });


	    var _reconnect = function () {
	        ++reconnectCount;
	        if (reconnectCount == 40) {
	            clearInterval(interval);
	        }

	        console.log('reconnecting to socket server...');
	        
	        var promise = get();

	        promise.then(function(){
	            socket.socket.reconnect();
	            clearInterval(interval);
	        }, function(){
	            console.log("connection failed! try to reconnect in 5 seconds...");
	        });
	    };

	    return {
	        on: function (eventName, callback) {
	            socket.on(eventName, function () {
	                var args = arguments;
	                $rootScope.$apply(function () {
	                    callback.apply(socket, args);
	                });
	            });
	        },
	        emit: function (eventName, data, callback) {
	            socket.emit(eventName, data, function () {
	                var args = arguments;
	                $rootScope.$apply(function () {
	                    if (callback) {
	                        callback.apply(socket, args);
	                    }
	                });
	            })
	        },
	        connect: function(f){
	        	flag = f;
	            if (socket.socket && !socket.socket.connected) 
	            	socket.socket.reconnect();
	        }, 
	        disconnect: function(f) {
	        	flag = f;
	        	if (socket.socket && socket.socket.connected) socket.socket.disconnect();
	        }
	    };
	});
});