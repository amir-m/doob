require.config({
	baseUrl: '/public/js',
	paths: {
		angular: 'lib/angular',
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
	'uiBootstrap',
	'controllers/home-ctrl',
	'controllers/login-ctrl',
	'controllers/register-ctrl',
	'controllers/sound-patterns-ctrl',
	'controllers/sound-pattern-ctrl',
	'controllers/user-ctrl',
	'services/auth',
	'services/socket',
	'services/io',
	'services/audio',
	'services/sequencer',
	'services/effects',
	'services/userloader',
	'services/patternsloader',
	'directives/play-inline',
	'directives/sound-picker',
	'directives/sound-pattern',
	'directives/sound-patterns',
	'directives/stop-event',
	'directives/new-sound-pattern',
	'directives/sp-name-input',
	'directives/search'
	], function($, angular, app, domReady) {
		
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
		    .when('/sound-patterns/:user', {
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
		    	controller: 'home-ctrl', 
		    	templateUrl: 'partials/me.html',
		    	resolve: function(auth, $location, $rootScope, doobio) {
			    	
			    	var promise = auth.authenticate('/home');

					function success(){
						$location.path('/home');
					}

					function failure () {
						$location.path('/login');
					}

					promise.then(success, failure);
				}
			})
			.when('/users/:user', {
				templateUrl: 'partials/user.html', 
				controller: 'user-ctrl', 
				resolve: {
					user: ['UserLoader', function(UserLoader) {
						return UserLoader();
					}]
				}
			})
			// when('/register', {templateUrl: 'views/register.html', controller: RegisterCtrl}).
			.otherwise({redirectTo: '/login'});

		 //    $httpProvider.defaults.useXDomain = true;
			// delete $httpProvider.defaults.headers.common['X-Requested-With'];

		}]);

		app.run(['$window', 'auth', '$location', 'socket', 'doobio', '$rootScope',function($window, auth, 
			$location, socket, doobio, $rootScope){

			// $rootScope.isConnected = false;
			// $rootScope.isDisconnected = true;

			$window.addEventListener("beforeunload", function (e) {
			  if (doobio.instances[$rootScope.username].isBroadcasting) {
				socket.emit('user:broadcast:stop', {
					broadcaster: $rootScope.username,
					event: 'user:broadcast:stop'
				});
				doobio.instances[$rootScope.username].isBroadcasting = false;
			  }
			  auth.destroy();
			});

			var promise = auth.authenticate('/home');

			function success(){

			}

			function failure () {
				$location.path('/login');
			}

			promise.then(success, failure);

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