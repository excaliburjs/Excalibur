const ex = require('@excalibur');
ex.Flags.enable('suppress-obsolete-message');

const testsContext = require.context('.', true, /Spec$/);
testsContext.keys().forEach(testsContext);

// // Relieve memory pressure in CI
// let previousMemory = (window.performance as any).memory;
// afterEach(() => {
//   (window as any).gc();

//   const currentMemory = (window.performance as any).memory;
//   const megabytes =  (currentMemory.usedJSHeapSize - previousMemory.usedJSHeapSize) * 0.000001
//   if (megabytes > 1) {
//     console.log('After test memory change MB:', megabytes);
//   }
//   previousMemory = currentMemory;
// });

const MemoryReporter = {
  previousMemory: (window.performance as any).memory,
  largeMemory: [],
  jasmineStarted: function(suiteInfo) {
    this.previousMemory = (window.performance as any).memory;
  },

  // suiteStarted: function(result) {
  // },

  // specStarted: function(result) {

  // },

  specDone: function(result) {
    if ((window as any).gc) {
      (window as any).gc();
    }
    const currentMemory = (window.performance as any).memory;
    const megabytes =  (currentMemory.usedJSHeapSize - this.previousMemory.usedJSHeapSize) * 0.000001;
    if (megabytes > 1) {
      const message = `Spec ${result.fullName} MB: ${megabytes}`;
      this.largeMemory.push({size: megabytes, message});
    }
    this.previousMemory = currentMemory;
  },

  // suiteDone: function(result) {
  // },

  jasmineDone: function(result) {
    this.largeMemory.sort((a, b) => {
      return b.size - a.size;
    });
    for (const test of this.largeMemory.slice(0, 20)){
      console.log(test.message); // eslint-disable-line
    }
  }
};

jasmine.getEnv().addReporter(MemoryReporter);

