/// <reference path='../../lib/excalibur.d.ts' />

var game = new ex.Engine({
   width: 500,
   height: 500
});

game.backgroundColor = ex.Color.Blue;


var actor = new ex.Actor();

actor.pos.x = 250;
actor.setWidth(10);
actor.pos.y = 250;
actor.setHeight(10);
actor.color = ex.Color.Red;

game.add(actor);

var zoomedIn = false;
game.input.pointers.primary.on('down', (evt: ex.Input.PointerEvent) => {
   if (!zoomedIn) {
      zoomedIn = true;
      game.currentScene.camera.zoom(5, 1000);
   } else {
      zoomedIn = false;
      game.currentScene.camera.zoom(.2, 1000);
   }
});

game.start();