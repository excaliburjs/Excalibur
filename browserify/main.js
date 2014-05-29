var ex = require("../dist/excalibur.js");

var game = new ex.Engine();

game.add(new ex.Actor(0, 0, 100, 100, ex.Color.Red));

game.start();