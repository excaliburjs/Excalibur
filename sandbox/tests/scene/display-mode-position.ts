/// <reference path='../../lib/excalibur.d.ts' />

document.querySelector('.top-left').addEventListener('click', function() {
  buildWorld('top left');
});

document.querySelector('.mid-right').addEventListener('click', function() {
  buildWorld('middle right');
});

document.querySelector('.mid-center').addEventListener('click', function() {
  buildWorld('middle center');
});

document.querySelector('.bottom-left').addEventListener('click', function() {
  buildWorld('bottom left');
});

document.querySelector('.top-right').addEventListener('click', function() {
  buildWorld('top right');
});

document.querySelector('.top-center').addEventListener('click', function() {
  buildWorld('top center');
});

document.querySelector('button').addEventListener('click', function() {
  buildWorld({
    top: (<HTMLInputElement>document.getElementById('top')).value,
    right: (<HTMLInputElement>document.getElementById('right')).value,
    bottom: (<HTMLInputElement>document.getElementById('bottom')).value,
    left: (<HTMLInputElement>document.getElementById('left')).value
  });
});

var buildWorld = function(position) {
  var oldGame = document.querySelector('canvas');
  if (oldGame) {
    oldGame.parentNode.removeChild(oldGame);
  }

  var game = new ex.Engine({
    height: 600,
    width: 800,
    displayMode: ex.DisplayMode.Position,
    position: position
  });

  var paddle = new ex.Actor(150, game.drawHeight - 40, 200, 20);
  paddle.color = ex.Color.Chartreuse;

  paddle.body.collisionType = ex.CollisionType.Fixed;

  game.add(paddle);

  game.input.pointers.primary.on('move', function(evt: ex.Input.PointerEvent) {
    paddle.pos.x = evt.worldPos.x;
  });

  game.start();
};
