/// <reference path="../../lib/excalibur.d.ts" />

var game = new ex.Engine({
  canvasElementId: 'game',
  width: 600,
  height: 400
});
debugger;
var gif = new ex.Gif('https://raw.githubusercontent.com/kevin192291/Excalibur/master/sandbox/tests/animatedSpriteFromGIf/sword.gif');
var loader = new ex.Loader([gif]);

var actor = new ex.Actor(100, 100, 50, 50, ex.Color.Red);
actor.onInitialize = () => {
  //   var sprite = new ex.Sprite({
  //     image: tex,
  //     x: 0,
  //     y: 0,
  //     width: 100,
  //     height: 100
  //   });
  //   actor.addDrawing(sprite);
};
// game.add(actor);
game.start(loader);
