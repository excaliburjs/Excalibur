/// <reference path="../../../../dist/Excalibur.d.ts" />

var game = new ex.Engine(600, 400);
var actor = new ex.Actor(100, 100, 50, 50, ex.Color.Red);

game.add(actor);

game.start().then(() => {
   
});

document.getElementById('move-ease').addEventListener('click', moveCameraEase.bind(this, ex.EasingFunctions.EaseInOutCubic));
document.getElementById('move-ease-linear').addEventListener('click', moveCameraEase.bind(this, ex.EasingFunctions.Linear));
document.getElementById('move-xy').addEventListener('click', moveCameraViaXY);

var sw = true;

function moveCameraEase(easingFn) {   

   var pos = new ex.Vector(sw ? 200 : 0, sw ? 200 : 0);
   if (sw) {
      game.currentScene.camera.move(pos, 500, easingFn).then(onLerpEnd);
   } else {
      game.currentScene.camera.move(pos, 500, easingFn).then(onLerpEnd);
   }

   sw = !sw;

   document.getElementById('lerp-false').style.display = 'none';
   document.getElementById('lerp-true').style.display = 'inline';
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

   var interrupted = target.x !== game.currentScene.camera.x ||
                     target.y !== game.currentScene.camera.y;

   ex.Logger.getInstance().info("Camera move ended, targeted pos", target, "interrupted?", interrupted);
   document.getElementById('lerp-false').style.display = 'inline';
   document.getElementById('lerp-true').style.display = 'none';
}