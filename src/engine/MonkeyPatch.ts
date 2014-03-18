if (typeof window == 'undefined') {
   window = (<any>{ audioContext: function () { } });
}

if (typeof window != 'undefined' && !window.requestAnimationFrame) {
   (<any>window).requestAnimationFrame =
   (<any>window).webkitRequestAnimationFrame ||
   (<any>window).mozRequestAnimationFrame ||
   function (callback) { window.setInterval(callback, 1000 / 60); };
}

if (typeof window != 'undefined' && !(<any>window).AudioContext) {
   (<any>window).AudioContext = (<any>window).webkitAudioContext || (<any>window).mozAudioContext;
}

// Polyfill from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some
if (!Array.prototype.some){
  Array.prototype.some = function(fun /*, thisArg */){
    'use strict';

    if (this === void 0 || this === null)
      throw new TypeError();

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== 'function')
      throw new TypeError();

    var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
    for (var i = 0; i < len; i++){
      if (i in t && fun.call(thisArg, t[i], i, t))
        return true;
    }

    return false;
  };
}