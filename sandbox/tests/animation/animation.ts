/// <reference path='../../lib/excalibur.d.ts' />

var width = 600;
var height = 400;
var playerTexture = new ex.Texture('animation.png');

var engine = new ex.Engine({
  width: width,
  height: height,
  canvasElementId: 'game',
  pointerScope: ex.Input.PointerScope.Canvas,
  suppressPlayButton: false
});
engine.backgroundColor = ex.Color.Black;

var player = new ex.Actor(width / 2, height / 2, 100, 30, ex.Color.Red);
player.anchor.setTo(0.5, 0.5);
var spritesheet = new ex.SpriteSheet(playerTexture, 3, 1, 100, 100);
var animation = spritesheet.getAnimationForAll(engine, 1500);
animation.loop = false;
player.addDrawing('default', animation);
engine.currentScene.add(player);

engine.input.keyboard.on('down', (keyDown?: ex.Input.KeyEvent) => {
  if (keyDown.key === ex.Input.Keys.D) {
    engine.isDebug = !engine.isDebug;
    console.log(animation.freezeFrame);
  }
});

engine.start(new ex.Loader([playerTexture])).then(() => {});
