/// <reference path="../../../../dist/Excalibur.d.ts" />

var game = new ex.Engine({
   width: 600,
   height: 400,
   pointerScope: ex.Input.PointerScope.Canvas
});
var actor = new ex.Actor(100, 100, 50, 50, ex.Color.Red);

game.add(actor);

game.start().then(() => {
   
});

var easingFn = ex.EasingFunctions.EaseInOutQuad;

game.input.pointers.primary.on('down', (evt: ex.Input.PointerEvent) => {
   game.currentScene.camera.move(new ex.Vector(evt.x, evt.y), 500, easingFn);
});
document.getElementById('move-ease-in-out-quad').addEventListener('click', moveCameraEase.bind(this, ex.EasingFunctions.EaseInOutQuad));
document.getElementById('move-ease-in-quad').addEventListener('click', moveCameraEase.bind(this, ex.EasingFunctions.EaseInQuad));
document.getElementById('move-ease-out-quad').addEventListener('click', moveCameraEase.bind(this, ex.EasingFunctions.EaseOutQuad));
document.getElementById('move-ease-in-out-cubic').addEventListener('click', moveCameraEase.bind(this, ex.EasingFunctions.EaseInOutCubic));
document.getElementById('move-ease-in-cubic').addEventListener('click', moveCameraEase.bind(this, ex.EasingFunctions.EaseInCubic));
document.getElementById('move-ease-out-cubic').addEventListener('click', moveCameraEase.bind(this, ex.EasingFunctions.EaseOutCubic));
document.getElementById('move-ease-linear').addEventListener('click', moveCameraEase.bind(this, ex.EasingFunctions.Linear));
document.getElementById('move-xy').addEventListener('click', moveCameraViaXY);

var sw = true;

function moveCameraEase(_easingFn) {
   easingFn = _easingFn
   /*
   var pos = new ex.Vector(sw ? 200 : 0, sw ? 200 : 0);
   if (sw) {
      game.currentScene.camera.move(pos, 500, easingFn);
   } else {
      game.currentScene.camera.move(pos, 500, easingFn);
   }

   sw = !sw;*/
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