angular.module('hm', []).
  config(['$routeProvider', function($routeProvider) {
  $routeProvider.
      when('/login', {templateUrl: 'partials/login.html',   controller: LoginCtrl}).
      when('/home', {templateUrl: 'partials/index.html',   controller: HomeCtrl}).
      // when('/register', {templateUrl: 'views/register.html', controller: RegisterCtrl}).
      otherwise({redirectTo: '/home'});
}]);