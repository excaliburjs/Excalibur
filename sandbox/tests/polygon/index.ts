///<reference path="../../lib/excalibur.d.ts" />

var game = new ex.Engine({
  width: 800,
  height: 600,
  displayMode: ex.DisplayMode.FitScreenAndFill
});
game.toggleDebug();
game.debug.collider.showBounds = false;

var actor = new ex.Actor({ pos: ex.vec(200, 100) });
// var shape = ex.Shape.Polygon([
//   ex.vec(0,0),
//   ex.vec(-1.6875,-25.0625),
//   ex.vec(6.3125,-25.0625),
//   ex.vec(5.625,-33.125),
//   ex.vec(21.5625,-32.8125),
//   ex.vec(21.4375,-40.6875),
//   ex.vec(29.1875,-41.9375),
//   ex.vec(32.8125,-38.3125),
//   ex.vec(33.0625,-21.8125),
//   ex.vec(25.8125,-21.5625),
//   ex.vec(24.125,10.375),
//   ex.vec(-8.75,8.5),
//   ex.vec(-11.8125,5.5625),
//   ex.vec(-10.9375,-0.5625),
//   ex.vec(-3.3125,-2.4375)
// ]);

// var points = [
//     ex.vec(0,0),
//     ex.vec(-1.6875,-25.0625),
//     ex.vec(6.3125,-25.0625),
//     ex.vec(5.625,-33.125),
//     ex.vec(21.5625,-32.8125),
//     ex.vec(21.4375,-40.6875),
//     ex.vec(29.1875,-41.9375),
//     ex.vec(32.8125,-38.3125),
//     ex.vec(33.0625,-21.8125),
//     ex.vec(25.8125,-21.5625),
//     ex.vec(24.125,10.375),
//     ex.vec(-8.75,8.5),
//     ex.vec(-11.8125,5.5625),
//     ex.vec(-10.9375,-0.5625),
//     ex.vec(-3.3125,-2.4375)
//   ]

// var points = [
//   ex.vec(200,100),
//   ex.vec(300,320),
//   ex.vec(400,100),
//   ex.vec(500,300),
//   ex.vec(350,300),
//   ex.vec(300,500),
//   ex.vec(250,300),
//   ex.vec(100,300)];

var points = [
  ex.vec(343, 392),
  ex.vec(475, 103),
  ex.vec(245, 151),
  ex.vec(193, 323),
  ex.vec(91, 279),
  ex.vec(51, 301),
  ex.vec(25, 381),
  ex.vec(80, 334),
  ex.vec(142, 418),
  ex.vec(325, 480),
  ex.vec(340, 564),
  ex.vec(468, 597)
];

var colinear = [ex.vec(160, 80), ex.vec(80, 40), ex.vec(0, 0)];

function triangleArea(a: ex.Vector, b: ex.Vector, c: ex.Vector) {
  return Math.abs(a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - c.y)) / 2;
}

console.log('triangle area', triangleArea(ex.vec(160, 80), ex.vec(80, 40), ex.vec(0, 0)));

var shape = ex.Shape.Polygon(points, ex.Vector.Zero, true);

var triangulated = shape.triangulate();
actor.collider.set(triangulated);
game.add(actor);

game.currentScene.camera.zoom = 0.75;
game.start();
