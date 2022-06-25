const ex = require('@excalibur');
ex.Flags.enable('suppress-obsolete-message');

const testsContext = require.context('.', true, /Spec$/);
testsContext.keys().forEach(testsContext);

beforeEach(function(done) {
  console.log('yo');
  window.setTimeout(function() {
    done();
  }, 0);
});
