// Karma configuration
// Generated on Thu Aug 08 2013 00:08:47 GMT-0400 (EDT)

module.exports = function(config) {
  config.set({

    // base path, that will be used to resolve files and exclude
    basePath: '',


    // frameworks to use
    frameworks: ['jasmine', 'requirejs'],


    // list of files / patterns to load in the browser
    files: [
        // JASMINE,
        // {pattern: 'public/js/lib/**/*.js', included: false},
        // 'public/js/lib/jquery.js',
        '/socket.io/socket.io.js/',
        'public/js/lib/angular.js',
        'public/js/lib/angular-mocks.js',
        {pattern: 'public/js/lib/*.js', included: false},
        {pattern: 'public/js/controllers/*.js', included: false},
        {pattern: 'public/js/directives/*.js', included: false},
        {pattern: 'public/js/services/*.js', included: false},
        // {pattern: 'public/js/*.js', included: false},
        {pattern: 'tests/unit/*Spec.js', included: false},
        {pattern: 'tests/unit/services/*Spec.js', included: false},
        {pattern: 'tests/unit/controllers/*Spec.js', included: false},
        {pattern: 'tests/unit/directives/*Spec.js', included: false},
        'public/js/controllers/controllers.js',
        // 'public/js/app-test.js',
        'public/js/main-test.js',
        // {pattern: 'test/*.js', included: false},
        // 'public/js/lib/require.js',
        // 'public/js/main.js',
        // 'public/js/lib/angular-mocks.js',
        // 'public/js/lib/angular-resource.js',
        // // 'public/js/lib/angular-cookies.js',
        // // 'public/js/lib/domready.js',
        // 'public/js/lib/ui-bootstrap-tpls-0.5.0.js',
        // 'public/js/lib/doob.js',
        // 'public/js/lib/io.js',
        // 'public/js/lib/effects.js',
        // 'public/js/lib/audio.js',
        // 'public/js/lib/sequencer.js',
        
        // 'public/js/controllers/*.js',
        // 'public/js/services/*.js',
        // 'public/js/directives/*.js',
        // 'public/js/app.js',
        // 'public/js/*',
        // 'views/index.html',
        // 'test/app.js',
        // 'app-test.js',
//      'public/test/*Spec.js',
//      'public/test/**/*Spec.js',
//      'public/test/**/*Spec.js',
//      'public/test/*.Spec.js',
//      'public/test/*.Spec.js'
    ],



    // list of files to exclude
    exclude: [
        'public/js/lib/jquery-2.0.3.min.map',
        'public/js/lib/version.txt',
        'public/js/main.js',
        'public/js/app.js',
        'public/js/bootstrap.js',
        'public/js/login.js',
    ],

    proxies: {
        '/' : 'http://localhost:8080/'
    },


    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    reporters: ['dots', 'spec'],

    loggers: [{type: 'console'}],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['Chrome'],


    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false,

    // plugins: [
    //     'karma-requirejs',
    //     'karma-jasmine',
    //     'karma-html2js-preprocessor',
    //     'karma-spec-reporter',
    // ]
  });
};
