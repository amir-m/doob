var services = angular.module('hm.services', ['ngResource']);


services.factory('Auth', ['$http', '$location', '$q', function($http, $location, $q){
    var myInfo = null;
    function _getMe (callback) {
        $http({
            cache: false,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            url: '/me'
        }).success(function(data, status, headers){
            myInfo = data;
            if (callback) callback(myInfo);
        }).error(function(data, status, headers){
            myInfo = null;
            callback(null);
        });
    }

    var authenticate = function() {
        var delay = $q.defer();
        _getMe(function(me){
            if (me) delay.resolve(true);
            else delay.reject(false);
        });
        return delay.promise;
    }
    var auth = {
        login: function(u, p, callback){
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
                _getMe(function(){
                    $location.path('/home');
                    if (callback) return callback(status);
                });
            }).error(function(error, status){
                if (callback) return callback(status);
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
                    _getMe(function(){
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
                $location.path('/login');
            }).error(function(){
                    $location.path('/login');
                });
        },
        authenticate: authenticate,    
        get me() {
            return myInfo;
        },
        get username() {
            return myInfo ? myInfo['username'] : null;
        }
    };

    return auth;
}]);

services.factory('socket', function ($rootScope, $http, Auth) {


    var socket = io.connect('/', {reconnect: false, 'try multiple transports': false});

    var interval;
    var reconnectCount = 0;
    
    socket.on('disconnect', function () {
        console.log('disconnected from socket server...');
        interval = setInterval(_reconnect, 5000);
    });

    socket.on('connection', function () {
        console.log('connected to the socket server.');

        socket.emit('register:me', Auth.username);
    });


    var _reconnect = function () {
        ++reconnectCount;
        if (reconnectCount == 40) {
            clearInterval(interval);
        }

        console.log('reconnecting to socket server...');
        var promise = Auth.authenticate();

        promise.then(function(){
            console.log("reconnected to the socket server");
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
        connect: function(){
            if (!socket.socket.connected) socket.socket.reconnect();
        }
    };
});
