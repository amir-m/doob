require.config({
	baseUrl: '/public/js',
	paths: {
		angular: 'lib/angular',
		angularResource: 'lib/angular-resource',
		// jquery: 'lib/jquery',
		domReady: 'lib/domReady',
		uiBootstrap: 'lib/ui-bootstrap-tpls-0.5.0',
		doob: 'lib/doob',
		io: 'lib/io',
		effects: 'lib/effects',
		audio: 'lib/audio'
	},
	shim: {
		'angular': {
			// deps: ['jquery'],
			exports: 'angular'
		},
		'angularResource': { deps: ['angular'] },
		'uiBootstrap': { deps: ['angular'] }
	}
});

require([
	'angular',
	'app', 
	'domReady',
	// 'jquery',
	'uiBootstrap',
	'controllers/HomeCtrl',
	'controllers/LoginCtrl',
	'services/Auth',
	'services/socket',
	'services/io',
	'services/audio',
	'services/sequencer',
	'services/effects',
	'directives/playInline',
	'directives/soundPicker',
	'directives/soundPattern',
	'directives/soundPatterns',
	'directives/stopEvent',
	'directives/patternNote',
	], function(angular, app, domReady, $) {
		
		'use strict';

		app.config(['$routeProvider', '$httpProvider', 
			function($routeProvider, $httpProvider) {
		  $routeProvider.
		      when('/login', {templateUrl: 'partials/login.html', controller: 'LoginCtrl'}).
		      when('/home', {templateUrl: 'partials/index.html', controller: 'HomeCtrl', resolve:
		      	function(Auth, $location, $rootScope, doobio){
		      		var status = Auth.authenticate();
		      		status.then(function(){
		      			// if user can be authenticated, create a doob instance for the
		      			// current logged in user. TODO: Fetch user's doob instances, activities, etc
		      			if (!doobio.get($rootScope.username)) doobio.create($rootScope.username);
		      			$rootScope.doob =doobio;
		      		}, function(){
		      			$location.path('/login');
		      		});
		      	}}).
		      // when('/me', {templateUrl: 'partials/me.html', controller: HomeCtrl}).
		      // when('/register', {templateUrl: 'views/register.html', controller: RegisterCtrl}).
		      otherwise({redirectTo: '/login'});

		    $httpProvider.defaults.useXDomain = true;
			delete $httpProvider.defaults.headers.common['X-Requested-With'];

		}]);

		app.run(['$window', function($window){

			$window.addEventListener("beforeunload", function (e) {
      			var confirmationMessage = "\o/";

			  (e || window.event).returnValue = confirmationMessage;     //Gecko + IE
			  console.log('sghoooooo')
			  // return confirmationMessage;                                //Webkit, Safari, Chrome etc.
			});

		}]);

		domReady(function() {
      		angular.bootstrap(document, ['hm']);

      		// $('html').addClass('ng-app: MyApp');
      		document.getElementsByTagName( 'html' )[0].setAttribute( "class", "ng-app: MyApp" );
      	});
	}
);
require(['app'], function(boot){
		// console.log(boot)
	
})