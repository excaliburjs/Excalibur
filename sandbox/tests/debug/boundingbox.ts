/// <reference path='../../lib/excalibur.d.ts' />

var game = new ex.Engine({ width: 500, height: 500 });

game.showDebug(true);

game.start().then(() => {
  var parent = new ex.Actor({ x: 100, y: 100, width: 100 * 1.5, height: 100 * 1.5, color: ex.Color.Red });
  var child = new ex.Actor({ x: 150, y: 150, width: 100, height: 100, color: ex.Color.White });
  parent.addChild(child);
  game.add(parent);
});
