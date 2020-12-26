/// <reference path='../../lib/excalibur.d.ts' />

var width = 600;
var height = 400;
var playerTexture = new ex.Texture('rotation-sprite.png');
var speed = 100;

var rotationType = ex.RotationType.ShortestPath;

var engine = new ex.Engine({
  width: width,
  height: height,
  canvasElementId: 'game',
  pointerScope: ex.Input.PointerScope.Canvas
});
engine.backgroundColor = ex.Color.Black;

var labelCurrentRotation = new ex.Label(rotationType.toString(), 500, 100);
labelCurrentRotation.color = ex.Color.White;
labelCurrentRotation.textAlign = ex.TextAlign.Center;
labelCurrentRotation.scale = new ex.Vector(2, 2);
engine.add(labelCurrentRotation);

engine.on('postupdate', (ev: ex.PostUpdateEvent) => {
  labelCurrentRotation.text = ex.RotationType[rotationType];
});

var player = new ex.Actor(width / 2, height / 2, 100, 30, ex.Color.Red);
var playerSprite = playerTexture.asSprite();
player.addDrawing('default', playerSprite);
engine.currentScene.add(player);

// rotation type buttons
var shortestPath = new ex.Actor(50, 50, 50, 50, ex.Color.White);
shortestPath.on('pointerdown', (e?: ex.Input.PointerEvent) => {
  rotationType = ex.RotationType.ShortestPath;
});
engine.add(shortestPath);

var labelShortestPath = new ex.Label('Shortest Path', shortestPath.pos.x, 100);
labelShortestPath.color = ex.Color.White;
labelShortestPath.textAlign = ex.TextAlign.Center;
engine.add(labelShortestPath);

var longestPath = new ex.Actor(150, 50, 50, 50, ex.Color.White);
longestPath.on('pointerdown', (e?: ex.Input.PointerEvent) => {
  rotationType = ex.RotationType.LongestPath;
});
engine.add(longestPath);

var labelLongestPath = new ex.Label('Longest Path', longestPath.pos.x, 100);
labelLongestPath.color = ex.Color.White;
labelLongestPath.textAlign = ex.TextAlign.Center;
engine.add(labelLongestPath);

var clockwise = new ex.Actor(250, 50, 50, 50, ex.Color.White);
clockwise.on('pointerdown', (e?: ex.Input.PointerEvent) => {
  rotationType = ex.RotationType.Clockwise;
});
engine.add(clockwise);

var labelClockwise = new ex.Label('Clockwise', clockwise.pos.x, 100);
labelClockwise.color = ex.Color.White;
labelClockwise.textAlign = ex.TextAlign.Center;
engine.add(labelClockwise);

var counterclockwise = new ex.Actor(350, 50, 50, 50, ex.Color.White);
counterclockwise.on('pointerdown', (e?: ex.Input.PointerEvent) => {
  rotationType = ex.RotationType.CounterClockwise;
});
engine.add(counterclockwise);

var labelCounterClockwise = new ex.Label('CounterClockwise', counterclockwise.pos.x, 100);
labelCounterClockwise.color = ex.Color.White;
labelCounterClockwise.textAlign = ex.TextAlign.Center;
engine.add(labelCounterClockwise);

engine.input.pointers.primary.on('down', (e: ex.Input.PointerEvent) => {
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

engine.input.keyboard.on('down', (keyDown?: ex.Input.KeyEvent) => {
  if (keyDown.key === ex.Input.Keys.D) {
    engine.toggleDebug();
  }
});

engine.start(new ex.Loader([playerTexture])).then(() => {});
