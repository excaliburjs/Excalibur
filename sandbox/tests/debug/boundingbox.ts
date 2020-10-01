/// <reference path='../../lib/excalibur.d.ts' />

var game = new ex.Engine({ width: 500, height: 500 });

game.showDebug(true);

game.start().then(() => {
  var parent = new ex.Actor(100, 100, 100 * 1.5, 100 * 1.5, ex.Color.Red);
  var child = new ex.Actor(150, 150, 100, 100, ex.Color.White);
  parent.add(child);
  game.add(parent);
});
