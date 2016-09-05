/// <reference path='../../excalibur.d.ts' />
var game = new ex.Engine({ width: 400, height: 300 });
var hrt = new ex.Texture('../../images/heart.png');
var ldr = new ex.Loader([hrt]);
game.start(ldr).then(function () {
    var a = new ex.Actor(50, 50, 50, 50, ex.Color.Red);
    var b = new ex.Actor(150, 50, 50, 50);
    b.addDrawing(hrt);
    b.opacity = 0;
    a.opacity = 0;
    game.add(a);
    game.add(b);
    a.actions.delay(1000).callMethod(function () {
        a.opacity = 1;
        b.opacity = 1;
    });
});
