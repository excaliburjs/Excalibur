

var game = new ex.Engine({
   width: 600,
   height: 400,
   canvasElementId: 'game'
});

game.isDebug = true;

var target = new ex.Actor(game.width / 2, game.height / 2, 100, 100, ex.Color.Red.clone());

var currentZoom = 1.0;

document.addEventListener('mousedown', (ev: MouseEvent) => {
   console.log(game.screenToWorldCoordinates(new ex.Point(ev.offsetX, ev.offsetY)));
});

target.on('pointerdown',(ev: ex.Input.PointerEvent) => {
  
   target.color = ex.Color.Green.clone();
});

target.on('pointerup',(ev: PointerEvent) => {
   target.color = ex.Color.Red.clone();
});

game.add(target);

game.input.keyboard.on('down', (ev: ex.Input.KeyEvent) => {
   if (ev.key == 107 /* + */) {
      game.currentScene.camera.zoom(currentZoom+=.03);
   }
   if (ev.key == 109 /* - */) {
      game.currentScene.camera.zoom(currentZoom-=.03);
   }

   var currentFocus = game.currentScene.camera.getFocus();
   if (ev.key == ex.Input.Keys.Left) {
      game.currentScene.camera.setFocus(currentFocus.x - 10, currentFocus.y);
   }
   if (ev.key == ex.Input.Keys.Right) {
      game.currentScene.camera.setFocus(currentFocus.x + 10, currentFocus.y);
   }
   if (ev.key == ex.Input.Keys.Up) {
      game.currentScene.camera.setFocus(currentFocus.x, currentFocus.y - 10);
   }
   if (ev.key == ex.Input.Keys.Down) {
      game.currentScene.camera.setFocus(currentFocus.x, currentFocus.y + 10);
   }

});


game.start();