/**
 * Polyfill adding function
 */
export function polyfill() {
  /* istanbul ignore next */
  if (typeof window !== 'undefined' && !(window as any).requestIdleCallback) {
    // Adapted from https://developer.chrome.com/blog/using-requestidlecallback#checking_for_requestidlecallback
    (window as any).requestIdleCallback =
      window.requestIdleCallback ||
      function (cb: (args: any) => any) {
        const start = Date.now();
        return setTimeout(function () {
          cb({
            didTimeout: false,
            timeRemaining: function () {
              return Math.max(0, 50 - (Date.now() - start));
            }
          });
        }, 1);
      };

    (window as any).cancelIdleCallback =
      window.cancelIdleCallback ||
      function (id: any) {
        clearTimeout(id);
      };
  }
}
