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

