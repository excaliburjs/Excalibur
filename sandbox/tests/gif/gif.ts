/// <reference path="../../lib/excalibur.d.ts" />

var game = new ex.Engine({
  canvasElementId: 'game',
  width: 600,
  height: 400
});

var gif: ex.Gif = new ex.Gif('https://raw.githubusercontent.com/kevin192291/Excalibur/master/sandbox/tests/gif/sword.gif', true);
var loader = new ex.Loader([gif]);
game.start(loader).then(() => {
  debugger;
  var sprite = gif.asSprite(0);
  var actor = new ex.Actor(0, 0, sprite.width, sprite.height);
  actor.addDrawing(sprite);
  game.add(actor);
});
