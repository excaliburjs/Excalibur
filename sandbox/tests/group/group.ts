/// <reference path='../../lib/excalibur.d.ts' />

(function() {



var width = 600;
var height = 400;
var minVel = -200;
var maxVel = 200;
var numActors = 300;
var blockTexture = new ex.ImageSource('block.png');
var engine = new ex.Engine({ width: width, height: height, canvasElementId: 'game' });
//engine.showDebug(true);
ex.Physics.useRealisticPhysics();
var blockGroup = ex.CollisionGroupManager.create('blocks');
var blockSprite2 = blockTexture.toSprite();
blockSprite2.scale.setTo(0.2, 0.2);

var player = new ex.Actor({x: width / 2, y: height / 2, width: 30, height: 30, color: ex.Color.Cyan});
player.body.collisionType = ex.CollisionType.Fixed;
player.body.group = ex.CollisionGroupManager.create('player');
engine.currentScene.add(player);

for (var i = 0; i < numActors; i++) {
  var actor = new ex.Actor({x: Math.random() * width, y: Math.random() * height, width: 0.2 * 64, height: 0.2 * 48});

  actor.graphics.add(blockSprite2.clone());

  actor.body.collisionType = ex.CollisionType.Active;
  actor.body.group = blockGroup;
  actor.on('postupdate', (e: ex.PostUpdateEvent) => {
    if (actor.pos.x < 0) {
      actor.vel.x = Math.abs(actor.vel.x);
    }

    if (actor.pos.y < 0) {
      actor.vel.y = Math.abs(actor.vel.y);
    }

    if (actor.pos.x > width) {
      actor.vel.x = -1 * Math.abs(actor.vel.x);
    }

    if (actor.pos.y > height) {
      actor.vel.y = -1 * Math.abs(actor.vel.y);
    }
  });

  actor.on('postcollision', (e: ex.PostCollisionEvent) => {

  });

  actor.vel = ex.vec(ex.randomInRange(minVel, maxVel), ex.randomInRange(minVel, maxVel));
  engine.add(actor);
}

engine.start(new ex.Loader([blockTexture])).then(() => {
  // do stuff
});

})();