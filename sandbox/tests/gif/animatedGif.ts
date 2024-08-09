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
var gif3: ex.Gif = new ex.Gif('./stoplight.gif');
var loader = new ex.Loader([gif, gif2, gif3]);
game.start(loader).then(() => {
  var stoplight = new ex.Actor({
    x: game.currentScene.camera.x + 120,
    y: game.currentScene.camera.y,
    width: gif3.width,
    height: gif3.height
  });
  stoplight.graphics.add(gif3.toAnimation());
  game.add(stoplight);

  var sword = new ex.Actor({
    x: game.currentScene.camera.x - 120,
    y: game.currentScene.camera.y,
    width: gif2.width,
    height: gif2.height
  });
  sword.graphics.add(gif2.toAnimation());
  game.add(sword);

  var loading = new ex.Actor({
    x: game.currentScene.camera.x,
    y: game.currentScene.camera.y,
    width: gif2.width,
    height: gif2.height
  });
  loading.graphics.add(gif.toAnimation());
  game.add(loading);
});
