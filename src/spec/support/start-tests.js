// initialize stack trace source map support
sourceMapSupport.install();

// start tests
window.jasmineHtmlReporter.initialize();
window.jasmineEnv.execute();