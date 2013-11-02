var tests = [];
for (var file in window.__karma__.files) {
  if (window.__karma__.files.hasOwnProperty(file)) {
    if (/Spec\.js$/.test(file)) {
      tests.push(file);
    }
  }
}

require.config({
    baseUrl: '/base/public/js',
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
    deps: tests
});


require([
    'angular',
    'angular-mocks',
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