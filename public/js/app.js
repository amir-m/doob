define(['angular', 'angularResource', 'angularCookies', 'uiBootstrap', 'controllers/controllers', 'services/services', 
'directives/directives', 'filters/filters'], 
function(angular){

    return angular.module('doob', 
	['ngResource', 'ngCookies', 'ui.bootstrap', 'controllers', 
	'services', 'directives', 'filters']);
});