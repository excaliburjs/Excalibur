/// <reference path="../../../../dist/excalibur.d.ts" />
var game = new ex.Engine({ width: 500, height: 500 });
game.isDebug = true;
game.start().then(function () {
    var parent = new ex.Actor(100, 100, 100, 100, ex.Color.Red);
    var child = new ex.Actor(150, 150, 100, 100, ex.Color.White);
    parent.scale.setTo(1.5, 1.5);
    parent.add(child);
    game.add(parent);
});
