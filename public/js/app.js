define(['angular', 'angularResource', 'uiBootstrap', 'controllers/controllers', 'services/services', 
      'directives/directives', 'filters/filters'], function(angular){

    return angular.module('hm', ['ngResource', 'ui.bootstrap', 'controllers', 'services', 
          'directives', 'filters']);
});