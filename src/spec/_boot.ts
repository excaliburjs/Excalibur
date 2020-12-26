const ex = require('@excalibur');
ex.Flags.enable('suppress-obsolete-message');

const testsContext = require.context('.', true, /Spec$/);
testsContext.keys().forEach(testsContext);
