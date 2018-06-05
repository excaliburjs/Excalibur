/// <reference path='../../lib/excalibur.d.ts' />

var game = new ex.Engine({
   width: 600,
   height: 400,
   pointerScope: ex.Input.PointerScope.Canvas
});
var actor = new ex.Actor(100, 100, 50, 50, ex.Color.Red);

actor.actions.moveTo(300, 300, 100);
actor.actions.moveTo(100, 100, 100);
actor.actions.repeatForever();

game.add(actor);

var actor2 = new ex.Actor(80, 80, 10, 10, ex.Color.Black);
var actor3 = new ex.Actor(320, 320, 10, 10, ex.Color.Black);
game.add(actor2);
game.add(actor3);

game.start().then(() => {
   
});


document.getElementById('lockToActor').addEventListener('click', () => {
   game.currentScene.camera.clearAllStrategies();
   game.currentScene.camera.strategy.lockToActor(actor);
});
document.getElementById('lockToActorAxisX').addEventListener('click', () => {
   game.currentScene.camera.clearAllStrategies();
   game.currentScene.camera.strategy.lockToActorAxis(actor, ex.Axis.X);
});
document.getElementById('lockToActorAxisY').addEventListener('click', () => {
   game.currentScene.camera.clearAllStrategies();
   game.currentScene.camera.strategy.lockToActorAxis(actor, ex.Axis.Y);
});
document.getElementById('elasticToActor').addEventListener('click', () => {
   game.currentScene.camera.clearAllStrategies();
   game.currentScene.camera.strategy.elasticToActor(actor, .05, .1);
});
document.getElementById('radiusAroundActor').addEventListener('click', () => {
   game.currentScene.camera.clearAllStrategies();
   game.currentScene.camera.strategy.radiusAroundActor(actor, 30);
});