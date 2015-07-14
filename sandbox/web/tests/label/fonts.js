/// <reference path="../../../../dist/Excalibur.d.ts" />

var game = new ex.Engine(800, 300, "game");

var label = new ex.Label("Should be 72px Impact", 20, 100, "12px Arial");
label.font = "72px Impact";
label.color = ex.Color.White;

var label2 = new ex.Label("Should be 20px Tahoma", 20, 150, "12px Arial");
label2.font = "20px Tahoma";
label2.color = ex.Color.Azure;

game.add(label);
game.add(label2);

game.start();