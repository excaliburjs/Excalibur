/// <reference path='../../lib/excalibur.d.ts' />

var width = 600;
var height = 400;
var playerTexture = new ex.ImageSource('rotation-sprite.png');
var speed = 100;

var rotationType = ex.RotationType.ShortestPath;

var engine = new ex.Engine({
  width: width,
  height: height,
  canvasElementId: 'game',
  pointerScope: ex.PointerScope.Canvas
});
engine.backgroundColor = ex.Color.Black;

var labelCurrentRotation = new ex.Label({ text: rotationType.toString(), x: 500, y: 100 });
labelCurrentRotation.color = ex.Color.White;
labelCurrentRotation.font.textAlign = ex.TextAlign.Center;
labelCurrentRotation.scale = new ex.Vector(2, 2);
engine.add(labelCurrentRotation);

engine.on('postupdate', (ev: ex.PostUpdateEvent) => {
  labelCurrentRotation.text = ex.RotationType[rotationType];
});

var player = new ex.Actor({ x: width / 2, y: height / 2, width: 100, height: 30, color: ex.Color.Red });
var playerSprite = playerTexture.toSprite();
player.graphics.add(playerSprite);
engine.currentScene.add(player);

// rotation type buttons
var shortestPath = new ex.Actor({ x: 50, y: 50, width: 50, height: 50, color: ex.Color.White });
shortestPath.on('pointerdown', (e?: ex.PointerEvent) => {
  rotationType = ex.RotationType.ShortestPath;
});
engine.add(shortestPath);

var labelShortestPath = new ex.Label({ text: 'Shortest Path', x: shortestPath.pos.x, y: 100 });
labelShortestPath.color = ex.Color.White;
labelShortestPath.font.textAlign = ex.TextAlign.Center;
engine.add(labelShortestPath);

var longestPath = new ex.Actor({ x: 150, y: 50, width: 50, height: 50, color: ex.Color.White });
longestPath.on('pointerdown', (e?: ex.PointerEvent) => {
  rotationType = ex.RotationType.LongestPath;
});
engine.add(longestPath);

var labelLongestPath = new ex.Label({ text: 'Longest Path', x: longestPath.pos.x, y: 100 });
labelLongestPath.color = ex.Color.White;
labelLongestPath.font.textAlign = ex.TextAlign.Center;
engine.add(labelLongestPath);

var clockwise = new ex.Actor({ x: 250, y: 50, width: 50, height: 50, color: ex.Color.White });
clockwise.on('pointerdown', (e?: ex.PointerEvent) => {
  rotationType = ex.RotationType.Clockwise;
});
engine.add(clockwise);

var labelClockwise = new ex.Label({ text: 'Clockwise', x: clockwise.pos.x, y: 100 });
labelClockwise.color = ex.Color.White;
labelClockwise.font.textAlign = ex.TextAlign.Center;
engine.add(labelClockwise);

var counterclockwise = new ex.Actor({ x: 350, y: 50, width: 50, height: 50, color: ex.Color.White });
counterclockwise.on('pointerdown', (e?: ex.PointerEvent) => {
  rotationType = ex.RotationType.CounterClockwise;
});
engine.add(counterclockwise);

var labelCounterClockwise = new ex.Label({ text: 'CounterClockwise', x: counterclockwise.pos.x, y: 100 });
labelCounterClockwise.color = ex.Color.White;
labelCounterClockwise.font.textAlign = ex.TextAlign.Center;
engine.add(labelCounterClockwise);

engine.input.pointers.primary.on('down', (e: ex.PointerEvent) => {
  if (
    !shortestPath.contains(e.worldPos.x, e.worldPos.y) &&
    !longestPath.contains(e.worldPos.x, e.worldPos.y) &&
    !clockwise.contains(e.worldPos.x, e.worldPos.y) &&
    !counterclockwise.contains(e.worldPos.x, e.worldPos.y)
  ) {
    var vector = new ex.Vector(e.worldPos.x - player.pos.x, e.worldPos.y - player.pos.y);
    var angle = vector.toAngle();

    player.actions.rotateTo(angle, 1, rotationType);
    //console.log('rotating from ' + player.rotation + ' to ' + angle);
  }
});

function distance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

engine.input.keyboard.on('down', (keyDown?: ex.KeyEvent) => {
  if (keyDown.key === ex.Keys.D) {
    engine.toggleDebug();
  }
});

engine.start(new ex.Loader([playerTexture])).then(() => {});
