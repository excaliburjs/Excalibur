/// <reference path="../../lib/excalibur.d.ts" />

var game = new ex.Engine({
  canvasElementId: 'game',
  width: 600,
  height: 400
});

var tex = new ex.ImageSource('https://cdn.rawgit.com/excaliburjs/Excalibur/7dd48128/assets/sword.png');

var loader = new ex.Loader([tex]);

var random = new ex.Random(1337);

var items = [{ pos: ex.Vector.Zero, vel: ex.vec(random.integer(50, 100), random.integer(50, 100)) }];
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
  const width = tex.width;
  const height = tex.height;
  game.onPostUpdate = (_engine, deltaMs) => {
    for (let i = 0; i < items.length; i++) {
      items[i].pos.addEqual(items[i].vel.scale(deltaMs / 1000));
      if (items[i].pos.x + width / 2 > 600 || items[i].pos.x < 0) {
        items[i].vel.x *= -1;
      }

      if (items[i].pos.y + height / 2 > 400 || items[i].pos.y < 0) {
        items[i].vel.y *= -1;
      }
    }
    game.graphicsContext.drawCircle(ex.vec(200, 200), width / 4, ex.Color.Blue, ex.Color.Black, 2);
  };

  game.onPostDraw = (_engine, deltaMs) => {
    const blue = ex.Color.Blue;
    const black = ex.Color.Black;
    for (let i = 0; i < items.length; i++) {
      game.graphicsContext.drawImage(tex.image, 0, 0, width, height, items[i].pos.x, items[i].pos.y, width / 2, height / 2);

      // game.graphicsContext.drawCircle(items[i].pos, width / 4, blue, black, 2);
      // game.graphicsContext.drawRectangle(items[i].pos, width, height, blue, black, 2);
    }
  };

  game.on('postframe', () => {
    drawCalls$.innerText = game.stats.currFrame.graphics.drawCalls.toString();
    drawnItems$.innerText = game.stats.currFrame.graphics.drawnImages.toString();
  });
});
