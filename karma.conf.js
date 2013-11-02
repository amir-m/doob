// Karma configuration
// Generated on Thu Aug 08 2013 00:08:47 GMT-0400 (EDT)

module.exports = function(config) {
  config.set({

    basePath: '',


    frameworks: ['jasmine', 'requirejs'],


    files: [


        'public/js/lib/require.js',
        '/socket.io/socket.io.js/',
        'public/js/lib/angular.js',
        'public/js/lib/angular-mocks.js',
        {pattern: 'public/js/lib/*.js', included: false},
        {pattern: 'public/js/controllers/*.js', included: false},
        {pattern: 'public/js/directives/*.js', included: false},
        {pattern: 'public/js/services/*.js', included: false},
        'public/js/controllers/controllers.js',
        'tests/unit/services/socketSpec.js',
        'public/js/main-test.js'

        

        
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
  });
};
