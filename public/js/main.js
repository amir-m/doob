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
	'services/PatternLoader', 
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

			var promise = auth.authenticate();

			function success(){


				// if (!doobio.get($rootScope.username)) {
				// 	doobio.create($rootScope.username);
				// }

				// var f = {
				// 	username: 1,
				// 	activities: 1,
				// 	followers: 1,
				// 	following: 1,
				// 	projects: 1,
				// 	password: 1,
				// 	soundPatterns: 1
				// };

				// var me = auth.me(f), _me;

				// me.then(function(data){
				// 	$rootScope.username = data.username;
					
				// 	_me = data;
				// 	_me._patterns = {};
				// 	_me._followers = {};
				// 	_me._following = {};

				// 	for (var i in _me.followers)
				// 		_me._followers[_me.followers[i].username] = _me.followers[i];

				// 	for (var i in _me.following)
				// 		_me._following[_me.following[i].username] = _me.following[i];


				// 	var promise = auth.getSoundPatterns();

				// 	promise.then(function(soundPatterns){

				// 		if (!doobio.instances[$rootScope.username])
				// 			doobio.create($rootScope.username);
						
				// 		for (var i in soundPatterns) {

				// 			_me._patterns[soundPatterns[i]._id] = soundPatterns[i];

				// 			for (var j in soundPatterns[i].content.tracks)

				// 				new doobio.instances[$rootScope.username].audio.Sound({
				// 					name: soundPatterns[i].content.tracks[j].name,
				// 					url: soundPatterns[i].content.tracks[j].url
				// 				});

				// 			new doobio.instances[$rootScope.username].sequencer.SoundPattern({
				// 				name: soundPatterns[i].name,
				// 				id: soundPatterns[i]._id, 
				// 				tracks: soundPatterns[i].content.tracks,
				// 				effects: soundPatterns[i].content.effects
				// 			});
				// 		}

				// 		setTimeout(function(){
				// 				$rootScope.me = _me;
				// 			$location.path('/home');
				// 			console.log($rootScope.me);
				// 		}, 5000);

				// 	}, function(error){
				// 		console.log(error);
				// 	});


				// }, function(er){
				// 	console.log(er);
				// });
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