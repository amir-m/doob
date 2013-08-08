angular.module('hm', ['hm.services']).config(['$routeProvider', function($routeProvider) {
  $routeProvider.
      when('/login', {templateUrl: 'partials/login.html', controller: LoginCtrl}).
      when('/home', {templateUrl: 'partials/index.html', controller: HomeCtrl}).
      when('/me', {templateUrl: 'partials/me.html', controller: HomeCtrl}).
      // when('/register', {templateUrl: 'views/register.html', controller: RegisterCtrl}).
      otherwise({redirectTo: '/home'});

}]);

