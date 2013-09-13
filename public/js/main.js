require.config({
	baseUrl: '/public/js',
	paths: {
		angular: 'lib/angular',
		socketio: '../../socket.io/socket.io',
		angularResource: 'lib/angular-resource',
		angularCookies: 'lib/angular-cookies',
		jquery: 'lib/jquery',
		domready: 'lib/domready',
		uiBootstrap: 'lib/ui-bootstrap-tpls-0.5.0',
		doob: 'lib/doob',
		io: 'lib/io',
		effects: 'lib/effects',
		audio: 'lib/audio',
		sequencer: 'lib/sequencer'
	},
	shim: {
		'socketio': {
			exports: 'io'
		},
		'angular': {
			deps: ['jquery'],
			exports: 'angular'
		},
		'angularResource': { deps: ['angular'] },
		'angularCookies': { deps: ['angular'] },
		'uiBootstrap': { deps: ['angular'] }
	}
});

require([
	'jquery',
	'angular',
	'app', 
	'domready',
	'socketio',
	'uiBootstrap',
	'services/auth',
	'services/socket',
	'services/io',
	'services/doob',
	'services/audio',
	'services/sequencer',
	'services/effects',
	'services/userloader',
	'services/patternsloader',
	'services/patternloader', 
	'services/me', 
	'controllers/ctrl',
	'controllers/home-ctrl',
	'controllers/login-ctrl',
	'controllers/register-ctrl',
	'controllers/sound-patterns-ctrl',
	'controllers/sound-pattern-ctrl',
	'controllers/user-ctrl',
	'directives/play-inline',
	'directives/sound-picker',
	'directives/sound-pattern',
	'directives/sound-patterns',
	'directives/stop-event',
	'directives/new-sound-pattern',
	'directives/sp-name-input',
	'directives/search',
	'directives/pinger',
	'directives/sp-comment'
	], function($, angular, app, domReady, socketio) {
		
		'use strict';

		app.config(['$routeProvider', '$httpProvider', 
			function($routeProvider, $httpProvider) {
		  $routeProvider.
		    when('/login', {
		    	templateUrl: 'partials/login.html', 
		    	controller: 'login-ctrl',
		    	resolve: function($rootScope, $location) {
		    		$scope.navBarClass('invisible');
		    		if ($rootScope.username) {
		    			$location.path('/home');
		    		}
		    	}
		  	})  
		    .when('/register', {
		    	templateUrl: 'partials/register.html', 
		    	controller: 'register-ctrl'
		    })
		    .when('/sound-patterns', {
		    	templateUrl: 'partials/sound-patterns.html', 
		    	controller: 'sound-patterns-ctrl',
		    	resolve: {
		    		patterns: ['PatternsLoader', function(PatternsLoader){
		    			return PatternsLoader();
		    		}]
		    	}
		    }).when('/sound-patterns/:user', {
		    	templateUrl: 'partials/sound-patterns.html', 
		    	controller: 'sound-patterns-ctrl',
		    	resolve: {
		    		patterns: ['PatternsLoader', function(PatternsLoader){
		    			return PatternsLoader();
		    		}]
		    	}
		    })
		    .when('/sound-patterns/:user/:id', {
		    	templateUrl: 'partials/sound-patterns.html', 
		    	controller: 'sound-patterns-ctrl',
		    	resolve: {
		    		patterns: ['PatternsLoader', function(PatternsLoader){
		    			return PatternsLoader();
		    		}]
		    	}
		    })
			.when('/home', {
				templateUrl: 'partials/me.html',
				controller: 'home-ctrl', 
				resolve: {
					myinfoz: ['me', function(me) {
						return me();
					}]
				}
			})
			.when('/users/:user', {
				templateUrl: 'partials/user.html', 
				controller: 'user-ctrl', 
				resolve: {
					myinfoz: ['me', function(me) {
						return me();
					}],
					user: ['UserLoader', function(UserLoader) {
						return UserLoader();
					}]
				}
			})
			// when('/register', {templateUrl: 'views/register.html', controller: RegisterCtrl}).
			.otherwise({redirectTo: '/home'});

		 //    $httpProvider.defaults.useXDomain = true;
			// delete $httpProvider.defaults.headers.common['X-Requested-With'];

		}]);

		app.run(['$window', 'auth', '$location', 'socket', 'doobio', '$rootScope',function($window, auth, 
			$location, socket, doobio, $rootScope){

			// $rootScope.isConnected = false;
			// $rootScope.isDisconnected = true;

			$window.addEventListener("beforeunload", function (e) {
			  if ($rootScope.username && doobio.instances[$rootScope.username] && doobio.instances[$rootScope.username].isBroadcasting) {
				socket.emit('user:broadcast:stop', {
					broadcaster: $rootScope.username,
					event: 'user:broadcast:stop'
				});
				doobio.instances[$rootScope.username].isBroadcasting = false;
			  }
			  // auth.destroy();
			});

			// var promise = auth.authenticate();

			// function success(){

			// }

			// function failure () {
			// 	$location.path('/login');
			// }

			// promise.then(success, failure);

		}]);

		domReady(function() {
      		angular.bootstrap(document, ['hm']);

      		$('html').addClass('ng-app: hm');
      		// document.getElementsByTagName( 'html' )[0].setAttribute( "class", "ng-app: hm" );
      	});
	}
);
require(['app'], function(boot){
		// console.log(boot)
	
})