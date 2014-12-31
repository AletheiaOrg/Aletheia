// Karma configuration

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      // angular source
      'app/public/bower_components/angular/angular.js',
      'app/public/bower_components/angular-route/angular-route.js',
      'app/public/bower_components/angular-mocks/angular-mocks.js',
      'app/public/bower_components/angular-ui-router/release/angular-ui-router.js',
      'app/public/bower_components/angular-ui-bootstrap-bower/ui-bootstrap.js',
      'http://d3js.org/d3.v3.js',

      // our app code
      'app/controllers/indexCtrl.js',
      // 'app/views/*.html',

      // our spec files
      'node_modules/expect.js/index.js',
      'specs/*.js'
    ],


    // list of files to exclude
    exclude: [
        'karma.conf.js'
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {

    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['nyan','unicorn'],


    // web server port
    port: 3000,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true
  });
};