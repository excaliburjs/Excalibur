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

// Polyfill from  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind#Polyfill

if (!Function.prototype.bind) {
   Function.prototype.bind = function (oThis) {
      if (typeof this !== 'function') {
         // closest thing possible to the ECMAScript 5
         // internal IsCallable function
         throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
      }

      var aArgs = Array.prototype.slice.call(arguments, 1),
         fToBind = this,
         fNOP = function () { },
         fBound = function () {
            return fToBind.apply(this instanceof fNOP && oThis
               ? this
               : oThis,
               aArgs.concat(Array.prototype.slice.call(arguments)));
         };

      fNOP.prototype = this.prototype;
      fBound.prototype = new fNOP();

      return fBound;
   };
}