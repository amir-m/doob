angular.module('hm', []).
  config(['$routeProvider', function($routeProvider) {
  $routeProvider.
      when('/login', {templateUrl: 'views/login.html',   controller: LoginCtrl}).
      when('/register', {templateUrl: 'views/register.html', controller: RegisterCtrl}).
      otherwise({redirectTo: '/home'});
}]);