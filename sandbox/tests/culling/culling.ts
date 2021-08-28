/// <reference path='../../lib/excalibur.d.ts' />

var width = 600;
var height = 400;
var playerTexture = new ex.ImageSource('culling-sprite.png');
var speed = 100;

var engine = new ex.Engine({ width: width, height: height, canvasElementId: 'game' });

engine.backgroundColor = ex.Color.Black;

var player = new ex.Actor({x: width / 2, y: height / 2, width: 30, height: 30, color: ex.Color.Red});
var playerSprite = playerTexture.toSprite();
player.graphics.add('default', playerSprite);
//player.currentDrawing.scale = new ex.Point(0.5, 0.5);
engine.currentScene.add(player);

engine.input.keyboard.on('down', (keyDown?: ex.Input.KeyEvent) => {
  if (keyDown.key === ex.Input.Keys.D) {
    engine.toggleDebug();
  } else if (keyDown.key === ex.Input.Keys.Up) {
    player.vel.y = -speed;
  } else if (keyDown.key === ex.Input.Keys.Down) {
    player.vel.y = speed;
  } else if (keyDown.key === ex.Input.Keys.Left) {
    player.vel.x = -speed;
  } else if (keyDown.key === ex.Input.Keys.Right) {
    player.vel.x = speed;
  }
});

engine.input.keyboard.on('up', (keyUp?: ex.Input.KeyEvent) => {
  if (keyUp.key === ex.Input.Keys.Up) {
    player.vel.y = 0;
  } else if (keyUp.key === ex.Input.Keys.Down) {
    player.vel.y = 0;
  } else if (keyUp.key === ex.Input.Keys.Left) {
    player.vel.x = 0;
  } else if (keyUp.key === ex.Input.Keys.Right) {
    player.vel.x = 0;
  }
});

engine.start(new ex.Loader([playerTexture])).then(() => {});
