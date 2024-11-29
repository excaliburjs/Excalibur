/// <reference path="../../lib/excalibur.d.ts" />

var game = new ex.Engine({
  canvasElementId: 'game',
  width: 600,
  height: 400,
  displayMode: ex.DisplayMode.FitScreenAndFill,
  pixelArt: true
  // antialiasing: false
});

var tex = new ex.ImageSource('https://cdn.rawgit.com/excaliburjs/Excalibur/7dd48128/assets/sword.png', {
  wrapping: ex.ImageWrapping.Repeat
});

var loader = new ex.Loader([tex]);

var sprite = new ex.Sprite({
  image: tex,
  sourceView: {
    x: 0,
    y: 0,
    width: 500,
    height: 500
  },
  destSize: {
    width: 1000,
    height: 1000
  }
});
var actor = new ex.Actor({
  x: 0,
  y: 0,
  anchor: ex.vec(0, 0),
  coordPlane: ex.CoordPlane.Screen,
  z: -10
});
actor.onInitialize = () => {
  actor.graphics.add(sprite);
};
actor.onPostUpdate = (engine, delta) => {
  sprite.sourceView.x += 0.05 * delta;
};
game.add(actor);
game.start(loader);

game.currentScene.camera.pos = actor.pos;
