/// <reference path='../../lib/excalibur.d.ts' />

var game = new ex.Engine({
  width: 500,
  height: 500
});

game.backgroundColor = ex.Color.Blue;

var actor = new ex.Actor();

actor.pos = ex.vec(250, 250);
actor.width = 10;
actor.height = 10;
actor.color = ex.Color.Red;

game.add(actor);

var zoomedIn = false;
game.input.pointers.primary.on('down', (evt: ex.Input.PointerEvent) => {
  if (!zoomedIn) {
    zoomedIn = true;
    game.currentScene.camera.zoomOverTime(5, 1000);
  } else {
    zoomedIn = false;
    game.currentScene.camera.zoomOverTime(0.2, 1000);
  }
});

game.start();
