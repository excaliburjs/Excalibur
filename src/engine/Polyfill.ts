import 'core-js/es/array';
import 'core-js/es/date';
import 'core-js/es/function';
import 'core-js/es/math';
import 'core-js/es/number';
import 'core-js/es/object';
import 'core-js/es/regexp';
import 'core-js/es/string';

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
}
