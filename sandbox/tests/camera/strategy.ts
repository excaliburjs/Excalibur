/// <reference path='../../lib/excalibur.d.ts' />

var game = new ex.Engine({
  width: 600,
  height: 400,
  pointerScope: ex.PointerScope.Canvas
});
var actor = new ex.Actor({ x: 100, y: 100, width: 50, height: 50, color: ex.Color.Red });

actor.actions.repeatForever((ctx) => ctx.moveTo(300, 300, 100).moveTo(100, 100, 100));

game.add(actor);

var actor2 = new ex.Actor({ x: 80, y: 80, width: 10, height: 10, color: ex.Color.Black });
var actor3 = new ex.Actor({ x: 320, y: 320, width: 10, height: 10, color: ex.Color.Black });
game.add(actor2);
game.add(actor3);

game.start().then(() => {});

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
  game.currentScene.camera.strategy.elasticToActor(actor, 0.05, 0.1);
});
document.getElementById('radiusAroundActor').addEventListener('click', () => {
  game.currentScene.camera.clearAllStrategies();
  game.currentScene.camera.strategy.radiusAroundActor(actor, 30);
});
