/**
 * Polyfill adding function
 */
export function polyfill() {
  /* istanbul ignore next */
  if (typeof window === 'undefined') {
    window = <any>{
      audioContext: function () {
        return;
      }
    };
  }
  /* istanbul ignore next */
  if (typeof window !== 'undefined' && !window.requestAnimationFrame) {
    (<any>window).requestAnimationFrame =
      (<any>window).webkitRequestAnimationFrame ||
      (<any>window).mozRequestAnimationFrame ||
      function (callback: Function) {
        window.setInterval(callback, 1000 / 60);
      };
  }
  /* istanbul ignore next */
  if (typeof window !== 'undefined' && !window.cancelAnimationFrame) {
    (<any>window).cancelAnimationFrame =
      (<any>window).webkitCancelAnimationFrame ||
      (<any>window).mozCancelAnimationFrame ||
      function () {
        return;
      };
  }
  /* istanbul ignore next */
  if (typeof window !== 'undefined' && !(<any>window).AudioContext) {
    if ((<any>window).webkitAudioContext) {
      const ctx = (<any>window).webkitAudioContext;
      const replaceMe = ctx.prototype.decodeAudioData;
      (<any>window).webkitAudioContext.prototype.decodeAudioData = function (arrayBuffer: ArrayBuffer) {
        return new Promise((resolve, reject) => {
          replaceMe.call(this, arrayBuffer, resolve, reject);
        });
      };
    }

    (<any>window).AudioContext =
      (<any>window).AudioContext ||
      (<any>window).webkitAudioContext ||
      (<any>window).mozAudioContext ||
      (<any>window).msAudioContext ||
      (<any>window).oAudioContext;
  }

  /* istanbul ignore next */
  if (typeof window !== 'undefined' && !(<any>window).devicePixelRatio) {
    (<any>window).devicePixelRatio = window.devicePixelRatio || 1;
  }

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
