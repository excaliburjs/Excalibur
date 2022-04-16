/// <reference path='../../lib/excalibur.d.ts' />

var game = new ex.Engine({
  width: 600,
  height: 400,
  canvasElementId: 'game'
});
game.setAntialiasing(false);

var raptorTex = new ex.ImageSource('raptor.png');
var raptorSheet = ex.SpriteSheet.fromImageSource({
  image: raptorTex,
  grid: {
    columns: 8, 
    rows:1, 
    spriteWidth: 64, 
    spriteHeight: 64
  }
});
var raptorAnim = ex.Animation.fromSpriteSheet(raptorSheet, ex.range(1, 8), 100, ex.AnimationStrategy.Loop);
raptorAnim.scale.setTo(2, 2);

game.showDebug(true);

var target = new ex.Actor({
  x: game.halfDrawWidth, 
  y: game.halfDrawHeight, 
  width: 64 * 2, 
  height: 64 * 2, 
});
target.graphics.add(raptorAnim);

var currentZoom = 1.0;

document.addEventListener('mousedown', (ev: MouseEvent) => {
  console.log(game.screenToWorldCoordinates(new ex.Vector(ev.offsetX, ev.offsetY)));
});

target.on('pointerdown', (ev: ex.Input.PointerEvent) => {
  target.color = ex.Color.Green.clone();
});

target.on('pointerup', (ev: ex.Input.PointerEvent) => {
  target.color = ex.Color.Red.clone();
});

game.add(target);

game.input.keyboard.on('down', (ev: ex.Input.KeyEvent) => {
  if (ev.key === ex.Input.Keys.NumAdd /* + */) {
    game.currentScene.camera.zoomOverTime((currentZoom += 0.03));
  }
  if (ev.key === ex.Input.Keys.NumSubtract /* - */) {
    game.currentScene.camera.zoomOverTime((currentZoom -= 0.03));
  }

  var currentFocus = game.currentScene.camera.getFocus();
  if (ev.key === ex.Input.Keys.Left) {
    game.currentScene.camera.x = currentFocus.x - 10;
  }
  if (ev.key === ex.Input.Keys.Right) {
    game.currentScene.camera.x = currentFocus.x + 10;
  }
  if (ev.key === ex.Input.Keys.Up) {
    game.currentScene.camera.y = currentFocus.y - 10;
  }
  if (ev.key === ex.Input.Keys.Down) {
    game.currentScene.camera.y = currentFocus.y + 10;
  }
});

var loader = new ex.Loader([raptorTex]);
game.start(loader);
