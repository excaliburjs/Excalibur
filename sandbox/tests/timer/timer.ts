/// <reference path="../../lib/excalibur.d.ts" />

var game = new ex.Engine({
  canvasElementId: 'game',
  width: 600,
  height: 400
});
var count: number = 0;
var callback = () => {
  count++;
  console.log(count);
};
var nTimer: ex.Timer = new ex.Timer(callback, 3000, true, 10);
game.add(nTimer);
game.start();
