/// <reference path='../../lib/excalibur.d.ts' />

var game = new ex.Engine({
  width: 800,
  height: 600
});

const ySort = { order: 1 };

const blue = new ex.Actor({
  pos: ex.vec(100, 100),
  width: 100,
  height: 100,
  color: ex.Color.Blue,
  ySort
});

const red = new ex.Actor({
  pos: ex.vec(100, 90),
  width: 100,
  height: 100,
  color: ex.Color.Red,
  ySort
});

const green = new ex.Actor({
  pos: ex.vec(100, 111),
  width: 100,
  height: 100,
  color: ex.Color.Green,
  ySort
});

const orange = new ex.Actor({
  pos: ex.vec(150, 114),
  width: 100,
  height: 100,
  color: ex.Color.Orange,
  ySort
});

const yellow = new ex.Actor({
  pos: ex.vec(100, 80),
  width: 100,
  height: 100,
  color: ex.Color.Yellow,
  ySort: { ...ySort, offset: 0 }
});

yellow.actions.repeatForever((ctx) => ctx.moveBy(0, 100, 25).moveBy(0, -100, 25));

game.add(blue);
game.add(red);
game.add(green);
game.add(orange);
game.add(yellow);
game.start();

yellow.on('postupdate', () => {
  console.log('y:', Math.round(yellow.pos.y), 'z:', yellow.z);
});
