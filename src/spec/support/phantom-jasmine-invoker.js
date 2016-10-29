// node api
var fs = require('fs'),
   path = require('path'),
   sprintf = require("sprintf-js").sprintf;

// load up phantom
var phantomjs = require('phantomjs-prebuilt');

console.log("Starting ex phantom runner");

var options = {
      version: '2.2.0',
      timeout: 10000,
      styles: [],
      specs: [],
      helpers: [],
      vendor: [],
      polyfills: [],
      customBootFile: null,
      outfile: '_SpecRunner.html',
      host: '',
      template: path.join(__dirname, '/jasmine/templates/DefaultRunner.tmpl'),
      templateOptions: {},
      junit: {},
      //ignoreEmpty: grunt.option('force') === true,
      display: 'full',
      summary: false
  };

function phantomRunner(options, cb) {
    var file = options.outfile;

    if (options.host) {
      if (!(/\/$/).test(options.host)) {
        options.host += '/';
      }
      file = options.host + options.outfile;
    }

    grunt.verbose.subhead('Testing jasmine specs via phantom').or.writeln('Testing jasmine specs via PhantomJS');
    grunt.log.writeln('');

    phantomjs.spawn(file, {
      failCode: 90,
      options: options,
      done: function(err) {
        cb(err, status);
      }
    });
  }

  phantomRunner(options, function(err, status) {
      var success = !err && status.failed === 0;

      if (err) {
        grunt.log.error(err);
      }
      if (status.failed === 0) {
        grunt.log.ok('0 failures');
      } else {
        grunt.log.error(status.failed + ' failures');
      }

      teardown(options, function() {
        done(success);
      });
    });


/*function launch(pathToPhantom, args){         
   var port = args.port || 9222;
   var phantomArgs = ['--remote-debugger-port=' + port];

   console.log(`spawn('${pathToExecutable}', ${JSON.stringify(pjsArgs) })`);
   var proc = spawn(pathToPhantom, phantomArgs, {
         detached: true,
         env: args.env,
         stdio: ['ignore'],
   });
   proc.unref();
   proc.on('error', (err) => {
         var errMsg = 'PhantomJS error: ' + err;
         console.error(errMsg);
         this.terminateSession(errMsg);
   });
   proc.on('close', () => {
         this.disconnect();
   });

}*/