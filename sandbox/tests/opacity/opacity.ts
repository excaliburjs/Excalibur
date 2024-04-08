/// <reference path='../../lib/excalibur.d.ts' />

var game = new ex.Engine({ width: 400, height: 300 });
var hrt = new ex.ImageSource('../../images/heart.png');
var ldr = new ex.Loader([hrt]);

game.start(ldr).then(() => {
  var a = new ex.Actor({ x: 50, y: 50, width: 50, height: 50, color: ex.Color.Red });
  var b = new ex.Actor({ x: 150, y: 50, width: 50, height: 50 });
  b.graphics.add(hrt.toSprite());

  b.graphics.opacity = 0;
  a.graphics.opacity = 0;

  game.add(a);
  game.add(b);

  a.actions.delay(1000).callMethod(() => {
    a.graphics.opacity = 1;
    b.graphics.opacity = 1;
  });
});
