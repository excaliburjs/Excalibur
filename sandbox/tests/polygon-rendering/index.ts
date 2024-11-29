var engine = new ex.Engine({
  width: 500,
  height: 400
});

var image = new ex.ImageSource('test.png');
var spriteSheet = ex.SpriteSheet.fromImageSource({
  image: image,
  grid: {
    rows: 1,
    columns: 4,
    spriteWidth: 100,
    spriteHeight: 100
  }
});

// Set up the moving object
// var mover = new ex.Actor({ x: 100, y: 0 });
// mover.anchor = ex.vec(0, 0);
// mover.actions.repeatForever((ctx) => ctx.moveTo(ex.vec(100, 300), 50).moveTo(ex.vec(100, 0), 50));
// mover.graphics.add('up', spriteSheet.sprites[0]);

var down = ex.Animation.fromSpriteSheet(spriteSheet, [0, 1, 2, 3], 500);

// mover.graphics.add('down', down);
// mover.onPreUpdate = () => {
//   if (mover.vel.y < 0) {
//     mover.graphics.use('up');
//   }
//   if (mover.vel.y > 0) {
//     mover.graphics.use('down');
//   }
// };

// set up the hexagon object
// var static1 = new ex.Actor({ x: 350, y: 100 });
var polygon1 = new ex.Polygon({
  points: [ex.vec(50, 0), ex.vec(150, 0), ex.vec(200, 86), ex.vec(150, 172), ex.vec(50, 172), ex.vec(0, 86)],
  color: ex.Color.fromRGB(0, 255, 0)
});
// static1.graphics.use(polygon1);

// set up the rectangle object
// var static2 = new ex.Actor({ x: 300, y: 300 });
var rect = new ex.Rectangle({ width: 100, height: 100, color: ex.Color.fromRGB(255, 0, 0) });
// static2.graphics.use(rect);

// set up the circle object
// var static3 = new ex.Actor({ x: 400, y: 300 });
var circle = new ex.Circle({ radius: 50, color: ex.Color.fromRGB(0, 0, 255) });
// static3.graphics.use(circle);

var loader = new ex.Loader([image]);

engine.currentScene.onPostDraw = (ctx) => {
  down.draw(ctx, 100, 100);
  polygon1.draw(ctx, 350, 100);
  rect.draw(ctx, 300, 300);
  circle.draw(ctx, 400, 300);

  down.tick(500, 1);
  down.draw(ctx, 100, 100);
  polygon1.draw(ctx, 350, 100);
  rect.draw(ctx, 300, 300);
  circle.draw(ctx, 400, 300);
};

// engine.add(mover);
// engine.add(static1);
// engine.add(static2);
// engine.add(static3);
engine.start(loader);
