import * as ex from '../../../build/dist/';
import gifPath from './sword.gif';

var game = new ex.Engine({
  canvasElementId: 'game',
  width: 600,
  height: 400,
  displayMode: ex.DisplayMode.FitScreen,
  antialiasing: false
});

game.currentScene.camera.zoom = 2;

var gif: ex.Gif = new ex.Gif(gifPath, ex.Color.Black);
var loader = new ex.Loader([gif]);
game.start(loader).then(() => {
  var actor = new ex.Actor({x: game.currentScene.camera.x, y: game.currentScene.camera.y, width: gif.width, height: gif.height});
  actor.graphics.add(gif.toAnimation(500));
  game.add(actor);
});
