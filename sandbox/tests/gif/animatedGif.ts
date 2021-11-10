/// <reference path="../../lib/excalibur.d.ts" />

// ex.Flags.enable(ex.Legacy.LegacyDrawing)
var game = new ex.Engine({
  canvasElementId: 'game',
  width: 600,
  height: 400,
  displayMode: ex.DisplayMode.FitScreen
});

game.currentScene.camera.zoom = 2;

var gif: ex.Gif = new ex.Gif('./sword.gif', ex.Color.Black);
var loader = new ex.Loader([gif]);
game.start(loader).then(() => {
  var actor = new ex.Actor({x: game.drawWidth / 2, y: game.drawHeight / 2, width: gif.width, height: gif.height});
  actor.graphics.add(gif.toAnimation(500));
  game.add(actor);
});
