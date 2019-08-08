/// <reference path="../../lib/excalibur.d.ts" />

var game = new ex.Engine({
  canvasElementId: 'game',
  width: 600,
  height: 400
});

var rcount: number = 0;
var rcallback = () => {
  rcount++;
  console.log(rcount);
};
var rtimer: ex.Timer = ex.Timer.RandomTimer(rcallback, 1, 5000, true, 20);
game.add(rtimer);
game.start();
