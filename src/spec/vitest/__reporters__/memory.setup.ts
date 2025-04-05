// this is in a separate file because this is executed in the browser

/**
 * Logs the data needed for the memory reporter. Should
 * be run once in setup file.
 */
export function setupMemoryReporter() {
  if (window.performance && window.performance.memory) {
    let previousMemory = window.performance.memory;

    afterEach((ctx) => {
      const currentMemory = window.performance.memory;
      const megabytes = (currentMemory.usedJSHeapSize - previousMemory.usedJSHeapSize) * 0.000001;
      ctx.task.meta.memory = { mb: megabytes };
      previousMemory = currentMemory;
    });
  }
}
