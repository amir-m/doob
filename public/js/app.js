define(['angular', 'angularResource', 'angularCookies', 'uiBootstrap', 'controllers/controllers', 'services/services', 
      'directives/directives', 'filters/filters'], function(angular){

    return angular.module('hm', ['ngResource', 'ngCookies', 'ui.bootstrap', 'controllers', 'services', 
          'directives', 'filters']);
});