var services = angular.module('hm.services', ['ngResource']);

services.factory('Auth', ['$http', '$location', function($http, $location){
    var myInfo = null;
    function _getMe (callback) {
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
    _getMe();

    var auth = {
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
                    _getMe(function(){
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
            // $location.path('/login');
            $http.get('/logout').success(function(res) {
                myInfo = null;
                $location.path('/login');
            }).error(function(){
                    $location.path('/login');
                });
        },
        get me() {
            return myInfo;
        },
        get username() {
            return myInfo ? myInfo['username'] : null;
        }
    };

    return auth;
}]);

services.factory('Me', ['$resource', function($resource){
    return $resource('/me/activity/:resource', {resource: '@resource'});
}]);

services.factory('Authenticate', ['$http', '$q', function($http, $q){

    var token = null;

    var login = function() {
        if (token) return true;
    }

    return function(){
        if (!token) {

        }
    };
}]);



services.factory('fetchUser', ['$q', '$http', 'Auth', function($q, $http, $Auth) {

    var deferred = $q.defer();

    var fetchUser = function(){

        deferred.resolve(me);

        deferred.reject('Unauthorized user!');
    }



    deferred.promise.then(Auth.login).
    then.(fetchMe)
    then(function(me){

    },
    function(error){

    });
}]);