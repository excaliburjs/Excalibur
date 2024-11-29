const ex = require('@excalibur');
ex.Flags.enable('suppress-obsolete-message');

const testsContext = require.context('.', true, /Spec$/);
testsContext.keys().forEach(testsContext);

// ensure consistent toEqualImage() resolution when running on hidpi displays
window.devicePixelRatio = 1;

const MemoryReporter = {
  previousMemory: (window.performance as any).memory,
  largeMemory: [],
  jasmineStarted: function (suiteInfo) {
    this.previousMemory = (window.performance as any).memory;
  },

  specDone: function (result) {
    const currentMemory = (window.performance as any).memory;
    const megabytes = (currentMemory.usedJSHeapSize - this.previousMemory.usedJSHeapSize) * 0.000001;
    if (megabytes > 1) {
      const message = `Spec ${result.fullName} MB: ${megabytes}`;
      this.largeMemory.push({ size: megabytes, message });
    }
    this.previousMemory = currentMemory;
  },

  jasmineDone: function (result) {
    this.largeMemory.sort((a, b) => {
      return b.size - a.size;
    });
    for (const test of this.largeMemory.slice(0, 20)) {
      console.log(test.message); // eslint-disable-line
    }
  }
};

const EngineReporter = {
  currentEngines: ex.Engine.InstanceCount,
  leaks: [],
  specDone: function (result) {
    if (this.currentEngines < ex.Engine.InstanceCount) {
      // const message = `Spec ${result.fullName} Engine increased: ${ex.Engine.InstanceCount}`;
      // console.log(message);
      this.leaks.push(result.fullName);
    }
    this.currentEngines = ex.Engine.InstanceCount;
  },

  jasmineDone: function (result) {
    let leakString = '============   Engine leaks ==================\n';
    for (const leak of this.leaks) {
      leakString += leak + '\n';
    }
    console.log(leakString); // eslint-disable-line
  }
};

const TimeoutSpecReporter = {
  specs: {},
  specStarted: function (result) {
    this.specs[result.fullName] = Date.now();
    const karma = (window as any).__karma__;
    setTimeout(() => {
      if (this.specs[result.fullName]) {
        karma.info({ type: 'Jasmine Timeout Reporter', specName: result.fullName });
      }
    }, 5000);
  },
  specDone: function (result) {
    delete this.specs[result.fullName];
  }
};

// jasmine.getEnv().addReporter(MemoryReporter);
jasmine.getEnv().addReporter(TimeoutSpecReporter);
jasmine.getEnv().addReporter(EngineReporter);
