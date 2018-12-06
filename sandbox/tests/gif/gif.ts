/// <reference path="../../lib/excalibur.d.ts" />

var game = new ex.Engine({
  canvasElementId: 'game',
  width: 600,
  height: 400
});

var gif: ex.Gif = new ex.Gif('sword.gif', ex.Color.Black);
var loader = new ex.Loader([gif]);
game.start(loader).then(() => {
  var actor = new ex.Actor(100, 100, 500, 500);
  actor.addDrawing('idle', gif.asAnimation(game, 500));
  game.add(actor);
});
