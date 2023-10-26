/// <reference path='../../lib/excalibur.d.ts' />

var game = new ex.Engine({
  width: 500,
  height: 500
});

game.backgroundColor = ex.Color.Blue;

var actor = new ex.Actor({
  x: 250,
  y: 250,
  width: 10,
  height: 10,
  color: ex.Color.Red
});

game.add(actor);

var zoomedIn = false;
game.input.pointers.primary.on('down', (evt: ex.PointerEvent) => {
  if (!zoomedIn) {
    zoomedIn = true;
    game.currentScene.camera.zoomOverTime(5, 1000);
  } else {
    zoomedIn = false;
    game.currentScene.camera.zoomOverTime(0.2, 1000);
  }
});

game.start();
