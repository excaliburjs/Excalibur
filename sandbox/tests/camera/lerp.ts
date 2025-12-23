/// <reference path='../../lib/excalibur.d.ts' />

var game = new ex.Engine({
  width: 600,
  height: 400,
  pointerScope: ex.PointerScope.Canvas
});
var actor = new ex.Actor({ x: 100, y: 100, width: 50, height: 50, color: ex.Color.Red });

game.add(actor);

game.start().then(() => {});

var easingFn = ex.easeInOutQuad;

game.input.pointers.primary.on('down', (evt: ex.PointerEvent) => {
  game.currentScene.camera.move(new ex.Vector(evt.worldPos.x, evt.worldPos.y), 500, easingFn).then((v) => onLerpEnd(v));
  document.getElementById('lerp-false').style.display = 'none';
  document.getElementById('lerp-true').style.display = 'inline';
});
document.getElementById('move-ease-in-out-quad').addEventListener('click', moveCameraEase.bind(this, ex.easeInOutQuad));
document.getElementById('move-ease-in-quad').addEventListener('click', moveCameraEase.bind(this, ex.easeInQuad));
document.getElementById('move-ease-out-quad').addEventListener('click', moveCameraEase.bind(this, ex.easeOutQuad));
document.getElementById('move-ease-in-out-cubic').addEventListener('click', moveCameraEase.bind(this, ex.easeInOutCubic));
document.getElementById('move-ease-in-cubic').addEventListener('click', moveCameraEase.bind(this, ex.easeInCubic));
document.getElementById('move-ease-out-cubic').addEventListener('click', moveCameraEase.bind(this, ex.easeOutCubic));
document.getElementById('move-ease-linear').addEventListener('click', moveCameraEase.bind(this, ex.linear));
document.getElementById('move-xy').addEventListener('click', moveCameraViaXY);

var sw = true;

function moveCameraEase(_easingFn) {
  easingFn = _easingFn;
  sw = !sw;
}

function moveCameraViaXY() {
  if (sw) {
    game.currentScene.camera.x = 200;
    game.currentScene.camera.y = 200;
  } else {
    game.currentScene.camera.x = 0;
    game.currentScene.camera.y = 0;
  }

  sw = !sw;
}

function onLerpEnd(target: ex.Vector) {
  var interrupted = target.x !== game.currentScene.camera.x || target.y !== game.currentScene.camera.y;

  ex.Logger.getInstance().info('Camera move ended, targeted pos', target, 'interrupted?', interrupted);
  document.getElementById('lerp-false').style.display = 'inline';
  document.getElementById('lerp-true').style.display = 'none';
}
