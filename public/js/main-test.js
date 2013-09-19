var tests = Object.keys(window.__karma__.files).filter(function (file) {
    return (/Spec\.js$/).test(file);
});

// requirejs.config({
//     // Karma serves files from '/base'
//     baseUrl: '/base/src',
//     paths: {
//         'angular': '../src/components/angular/angular',
//         'angularResource': '../src/components/angular-resource/angular-resource',
//         'angularMocks': '../src/components/angular-mocks/angular-mocks',
//         'app': '../src/js/app'
//     },

//     shim: {
//         'app': {
//             deps: ['angular', 'angularResource'],
//             exports: 'app'
//         },
//         'angularResource': {
//             deps: ['angular'],
//             exports: 'angularResource'
//         },
//         'angularMocks': {
//             deps: ['angularResource'],
//             exports: 'angularMocks'
//         }
//     },
//     // ask Require.js to load these files (all our tests)
//     deps: tests,
//     // start test run, once Require.js is done
//     callback: window.__karma__.start
// });


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
        sequencer: 'lib/sequencer',
        'angular-mocks':'lib/angular-mocks',
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
        'uiBootstrap': { deps: ['angular'] },
        'angular-mocks': { deps: ['angular'] }
    },
    // // ask Require.js to load these files (all our tests)
    deps: tests
    // // start test run, once Require.js is done
    // callback: window.__karma__.start
});

// require(['app-test'], function(app){
//     app.config(['$routeProvider', '$httpProvider', 
//         function($routeProvider, $httpProvider) {
//       $routeProvider.
//         when('/login', {
//             templateUrl: 'partials/login.html', 
//             controller: 'login-ctrl',
//             resolve: function($rootScope, $location) {
//                 $scope.navBarClass('invisible');
//                 if ($rootScope.username) {
//                     $location.path('/home');
//                 }
//             }
//         })  
//         // .when('/register', {
//         //  templateUrl: 'partials/register.html', 
//         //  controller: 'register-ctrl'
//         // })
//         .when('/sound-patterns/:user', {
//             templateUrl: 'partials/sound-patterns.html', 
//             controller: 'sound-patterns-ctrl',
//             resolve: {
//                 patterns: ['PatternsLoader', function(PatternsLoader){
//                     return PatternsLoader();
//                 }]
//             }
//         })
//         .when('/sound-patterns/:user/:id', {
//             templateUrl: 'partials/sound-patterns.html', 
//             controller: 'sound-patterns-ctrl',
//             resolve: {
//                 patterns: ['PatternsLoader', function(PatternsLoader){
//                     return PatternsLoader();
//                 }]
//             }
//         })
//         .when('/home', {
//             controller: 'home-ctrl', 
//             templateUrl: 'partials/me.html',
//             resolve: function(auth, $location, $rootScope, doobio) {
                
//                 var promise = auth.authenticate('/home');

//                 function success(){
//                     $location.path('/home');
//                 }

//                 function failure () {
//                     $location.path('/login');
//                 }

//                 promise.then(success, failure);
//             }
//         })
//         .when('/users/:user', {
//             templateUrl: 'partials/user.html', 
//             controller: 'user-ctrl', 
//             resolve: {
//                 user: ['UserLoader', function(UserLoader) {
//                     return UserLoader();
//                 }]
//             }
//         })
//         // when('/register', {templateUrl: 'views/register.html', controller: RegisterCtrl}).
//         .otherwise({redirectTo: '/login'});

//      //    $httpProvider.defaults.useXDomain = true;
//         // delete $httpProvider.defaults.headers.common['X-Requested-With'];

//     }]);

//     app.run(['$window', 'auth', '$location', 'socket', 'doobio', '$rootScope',function($window, auth, 
//                 $location, socket, doobio, $rootScope){

//         // $rootScope.isConnected = false;
//         // $rootScope.isDisconnected = true;

//         $window.addEventListener("beforeunload", function (e) {
//           if (doobio.instances[$rootScope.username].isBroadcasting) {
//             socket.emit('user:broadcast:stop', {
//                 broadcaster: $rootScope.username,
//                 event: 'user:broadcast:stop'
//             });
//             doobio.instances[$rootScope.username].isBroadcasting = false;
//           }
//           auth.destroy();
//         });

//         var promise = auth.authenticate();

//         function success(){
//         }

//         function failure () {
//             $location.path('/login');
//         }

//         promise.then(success, failure);

//     }]);
//    window.__karma__.start(); 
// });


require([
    'angular',
    'angular-mocks',
    'app-test', 
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
    'services/doob',
    'directives/play-inline',
    'directives/sound-picker',
    'directives/sound-pattern',
    'directives/sound-patterns',
    'directives/stop-event',
    'directives/new-sound-pattern',
    'directives/sp-name-input',
    'directives/search',
    'directives/pinger'
    ], function() {
        window.__karma__.start();
    });