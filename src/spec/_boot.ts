const ex = require('@excalibur');
ex.Flags.enable('suppress-obsolete-message');

const testsContext = require.context('.', true, /Spec$/);
testsContext.keys().forEach(testsContext);

// Wild hack to avoid karma from locking up
// https://github.com/jasmine/jasmine/issues/1327#issuecomment-300095516
beforeEach(function(done) {
  window.setTimeout(function() {
    done();
  }, 0);
});
