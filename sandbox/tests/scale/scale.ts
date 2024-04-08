/// <reference path='../../lib/excalibur.d.ts' />

var game = new ex.Engine({
  width: 800,
  height: 600
});

// create an asset loader
var loader = new ex.Loader();
var resources = {
  txPlayer: new ex.ImageSource('logo.png')
};

// queue resources for loading
for (var r in resources) {
  loader.addResource(resources[r]);
}

var target = new ex.Actor({ x: 500, y: 500, width: 20, height: 20, color: ex.Color.Red });
game.add(target);

var aim = new ex.Actor({ x: game.halfDrawWidth, y: game.halfDrawHeight, width: 100, height: 10, color: ex.Color.Black });
aim.graphics.add(resources.txPlayer.toSprite());
aim.scale.setTo(1, 0.2);
game.add(aim);

// uncomment loader after adding resources
game.start(loader).then(() => {
  game.input.pointers.primary.on('move', (ev: ex.PointerEvent) => {
    target.pos.setTo(ev.worldPos.x, ev.worldPos.y);

    var aimVec = target.pos.sub(aim.pos);
    aim.rotation = aimVec.toAngle();
  });
});
