/// <reference path="../../../../dist/Excalibur.d.ts" />
var game = new ex.Engine({ width: 500, height: 500 });
game.backgroundColor = ex.Color.White;
// center anchored actors
var cl = new ex.Label('Centered', 0, 30);
cl.textAlign = ex.TextAlign.Center;
var ca1 = new ex.Actor(0, 0, 15, 15, ex.Color.Red);
var ca2 = new ex.Actor(0, 0, 10, 10, ex.Color.Green);
var ca3 = new ex.Actor(0, 0, 10, 10, ex.Color.Blue);
ca1.anchor.setTo(0.5, 0.5);
ca2.anchor.setTo(0.5, 0.5);
ca3.anchor.setTo(0.5, 0.5);
ca2.scale.setTo(2, 2);
ca3.rotation = ex.Util.toRadians(45);
game.add(ca2);
game.add(ca1);
game.add(ca3);
game.add(cl);
// top left anchored actors
// top right anchored actors
// bottom left anchored actors
// bottom right anchored actors
game.currentScene.camera.x = 0;
game.currentScene.camera.y = 0;
game.start();
