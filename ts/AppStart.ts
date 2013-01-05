
/// <reference path="Game.ts" />

// Create an start the game
var game = new Engine.SimpleGame(1000,500,true);

for(var i = 0; i< 5; i++){
	var color = new Engine.Color(Math.random()*255,Math.random()*255,Math.random()*255);
	//alert(color.toString());
	game.addBlock(new Engine.Block(new Engine.Box(100*i+10,200+Math.random()*100,50,50),color));
}
game.addActor(new Engine.Player(100,100,100,100));

//var box1 = new Engine.Box(0,0,10,10);
//var box2 = new Engine.Box(0,1,10,10);
//alert(String(box1.collides(box2)));
//alert(String(box1.collides(new Engine.Box(100,100,10,10))));

//alert(String(Algebra.Util.Equals(1,1.2,.1)));

game.start();