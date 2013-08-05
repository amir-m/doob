angular.module('hm', []).
  config(['$routeProvider', function($routeProvider) {
  $routeProvider.
      when('/login', {templateUrl: 'partials/login.html',   controller: LoginCtrl}).
      // when('/logout', {templateUrl: 'views/login.html',   controller: LogoutCtrl}).
      // when('/register', {templateUrl: 'views/register.html', controller: RegisterCtrl}).
      otherwise({redirectTo: '/home'});
}]);