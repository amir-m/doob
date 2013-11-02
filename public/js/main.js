require.config({
	baseUrl: '/public/js',
	paths: {
		angular: 'lib/angular',
		socketio: '../../socket.io/socket.io',
		angularResource: 'lib/angular-resource',
		angularCookies: 'lib/angular-cookies',
		jquery: 'lib/jquery',
		jqueryui: 'lib/jqueryui',
		domready: 'lib/domready',
		wavesurfer: 'lib/wavesurfer.min',
		uiBootstrap: 'lib/ui-bootstrap-tpls-0.5.0',
		doob: 'lib/doob',
		io: 'lib/io',
		effects: 'lib/effects',
		audio: 'lib/audio',
		sequencer: 'lib/sequencer',
		soundManager: 'lib/soundmanager2'
	},
	shim: {
		'jqueryui': { deps: ['jquery'] },
		'socketio': { exports: 'io' },
		'angular': {
			deps: ['jquery', 'jqueryui'],
			exports: 'angular'
		},
		'angularResource': { deps: ['angular'] },
		'angularCookies': { deps: ['angular'] },
		'wavesurfer': { exports: 'WaveSurfer' },
		'soundManager': { exports: 'soundManager' },
		'uiBootstrap': { deps: ['angular'] }
	}
});

require([
	'jquery',
	'angular',
	'app', 
	'domready',
	'wavesurfer',
	'soundManager',
	'socketio',
	'jqueryui',
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
	'services/wavesurfer', 
	'services/settingsloader', 
	'services/id', 
	'controllers/ctrl',
	'controllers/home-ctrl',
	'controllers/login-ctrl',
	'controllers/register-ctrl',
	'controllers/sound-patterns-ctrl',
	'controllers/sound-pattern-ctrl',
	'controllers/user-ctrl',
	'controllers/upload-ctrl',
	'controllers/settings-ctrl',
	'directives/play-inline',
	'directives/sound-picker',
	'directives/sound-pattern',
	'directives/sound-patterns',
	'directives/stop-event',
	'directives/new-sound-pattern',
	'directives/sp-name-input',
	'directives/search',
	'directives/pinger',
	'directives/sp-comment',
	'directives/sp-change-tempo',
	'directives/sp-change-steps',
	'directives/settings-security',
	'directives/settings-notifications', 
	'directives/draggable',
	'directives/droppable',
	'directives/sortable-table', 
	'directives/add-sound',
	'directives/file-uploader',
	'directives/audio-track',
	'directives/update-time',
	'filters/time',
	'filters/file-size'
	], 
	function($, angular, app, domReady, soundManager) {
		'use strict';

		app.config(
		['$routeProvider', '$httpProvider', 
		function($routeProvider, $httpProvider) {
			$httpProvider.responseInterceptors.push(
				['$q', function($q) {
					return function(promise) {
						return promise.then(function (response) {

							return response;

						}, function (response) {
							console.log(response.status)
							if (response.status == 401) {
								// $.ajax({
								// 	type: "POST",
								// 	url: "/login"
								// }).done(function (data) {
								// 	console.log(data)
								// })
									return response;
							}
							else return response;
							
						});	
					}
				}
			]);
			$routeProvider.
			when('/login', {
				templateUrl: 'partials/login.html', 
				controller: 'LoginCtrl',
				resolve: {
					authenticate: function($rootScope, $location, auth) {
			    	
			    		var promise = auth.authenticate();	

			    		promise.then(function(){
							$location.path('/home');
						});
			    	}
				}
				})  
			.when('/register', {
				templateUrl: 'partials/register.html', 
				controller: 'RegisterCtrl'
			})
			.when('/sound-patterns', {
				templateUrl: 'partials/sound-patterns.html', 
				controller: 'SoundPatternsCtrl',
				resolve: {
					patterns: ['PatternsLoader', function(PatternsLoader){
						return PatternsLoader();
					}],
					myinfoz: ['me', function(me) {
						return me();
					}]
				}
			})
			.when('/sound-patterns/:user', {
				templateUrl: 'partials/sound-patterns.html', 
				controller: 'SoundPatternsCtrl',
				resolve: {
					patterns: ['PatternsLoader', 
					function(PatternsLoader){
						return PatternsLoader();
					}]
				}
			})
			.when('/sound-patterns/:user/:id', {
				templateUrl: 'partials/sound-patterns.html', 
				controller: 'SoundPatternsCtrl',
				resolve: {
					patterns: ['PatternsLoader', 
					function(PatternsLoader){
						return PatternsLoader();
					}]
				}
			})
			.when('/home', {
				templateUrl: 'partials/me.html',
				controller: 'HomeCtrl', 
				resolve: {
					myinfoz: ['me', function(me) {
						return me();
					}]
				}
			})
			.when('/users/:user', {
				templateUrl: 'partials/user.html', 
				controller: 'UserCtrl', 
				resolve: {
					user: ['UserLoader', function(UserLoader) {
						return UserLoader();
					}]
				}
			})
			.when('/upload', {
				templateUrl: 'partials/upload.html', 
				controller: 'UploadCtrl', 
				resolve: {
					myinfoz: ['me', function(me) {
						
						return me();
					}]
				}
			})
			.when('/settings', {
				// templateUrl: 'partials/settings.html', 
				// controller: 'SettingsCtrl', 
				// resolve: {
				// 	settings: ['SettingsLoader', function(SettingsLoader) {
				// 		return SettingsLoader();
				// 	}]
				// }
				redirectTo: '/settings/security'
			})
			.when('/settings/:setting', {
				templateUrl: 'partials/settings.html', 
				controller: 'SettingsCtrl', 
				resolve: {
					settings: ['SettingsLoader', function(SettingsLoader) {
						return SettingsLoader();
					}]
				}
			})
			.otherwise({redirectTo: '/home'});

		}]);

		app.run([
		'$window', 'socket', '$rootScope', 'me', 'doobio', '$http', 
		function($window, socket, $rootScope, me, doobio, $http){

			$window.addEventListener("beforeunload", function (e) {
			  if ($rootScope.username && doobio.instances[$rootScope.username] && doobio.instances[$rootScope.username].isBroadcasting) {
				socket.emit('user:broadcast:stop', {
					broadcaster: $rootScope.username,
					event: 'user:broadcast:stop'
				});
			  }
			});

		}]);

		domReady(function() {
      		angular.bootstrap(document, ['doob']);
      		$('html').addClass('ng-app: doob');
      	});

      	soundManager.setup({
      		url: '/public/swf/',
      		flashVersion: 9,
      		useHTML5Audio: true
      	});
	}
);
