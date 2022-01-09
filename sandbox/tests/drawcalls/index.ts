/// <reference path="../../lib/excalibur.d.ts" />


var game = new ex.Engine({
  canvasElementId: 'game',
  width: 600,
  height: 400
});

var tex = new ex.ImageSource('https://cdn.rawgit.com/excaliburjs/Excalibur/7dd48128/assets/sword.png');

var loader = new ex.Loader([tex]);

var random = new ex.Random(1337);

var items = [{pos: ex.Vector.Zero, vel: ex.vec(random.integer(50, 100), random.integer(50, 100))}];
var drawCalls$ = document.getElementById('draw-calls');
var drawnItems$ = document.getElementById('drawn-items');
var add$ = document.getElementById('add');
add$.addEventListener('click', () => {
  for (let i = 0; i < 1000; i++) {
    items.push({
      pos: ex.vec(0, 0),
      vel: ex.vec(random.integer(50, 100), random.integer(50, 100))
    });
  }
});

game.start(loader).then(() => {
  game.onPostUpdate = (_engine, deltaMs) => {
    for (let i = 0; i < items.length; i++) {
      items[i].pos.addEqual(items[i].vel.scale(deltaMs/1000));
      if ((items[i].pos.x + tex.width) > 600 || items[i].pos.x < 0) {
        items[i].vel.x *= -1;
      }

      if ((items[i].pos.y + tex.height) > 400 || items[i].pos.y < 0) {
        items[i].vel.y *= -1;
      }
    }

    for (let i = 0; i < items.length; i++) {
      game.graphicsContext.drawImage(tex.image, items[i].pos.x, items[i].pos.y);
    }
  };

  game.on('postframe', () => {
    drawCalls$.innerText = game.stats.currFrame.graphics.drawCalls.toString();
    drawnItems$.innerText = game.stats.currFrame.graphics.drawnImages.toString();
  });
});
