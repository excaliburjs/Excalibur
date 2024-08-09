/// <reference path="../../lib/excalibur.d.ts" />

var game = new ex.Engine({
  canvasElementId: 'game',
  width: 600,
  height: 400,
  displayMode: ex.DisplayMode.FitScreen,
  antialiasing: false
});

game.currentScene.camera.zoom = 2;

var gif: ex.Gif = new ex.Gif('./loading-screen.gif');
var gif2: ex.Gif = new ex.Gif('./sword.gif');
var loader = new ex.Loader([gif, gif2]);
game.start(loader).then(() => {
  var actor = new ex.Actor({ x: game.currentScene.camera.x, y: game.currentScene.camera.y, width: gif.width, height: gif.height });
  actor.graphics.add(gif.toAnimation(50));
  game.add(actor);
});
