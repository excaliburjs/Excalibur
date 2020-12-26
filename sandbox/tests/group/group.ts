/// <reference path='../../lib/excalibur.d.ts' />

var width = 600;
var height = 400;
var minVel = -200;
var maxVel = 200;
var numActors = 300;
var blockTexture = new ex.Texture('block.png');
var engine = new ex.Engine({ width: width, height: height, canvasElementId: 'game' });
//engine.showDebug(true);
ex.Physics.useRigidBodyPhysics();
var blockGroup = ex.CollisionGroupManager.create('blocks');
var blockSprite = blockTexture.asSprite();
blockSprite.scale.setTo(0.2, 0.2);

var player = new ex.Actor(width / 2, height / 2, 30, 30, ex.Color.Cyan);
player.body.collider.type = ex.CollisionType.Fixed;
player.body.collider.group = ex.CollisionGroupManager.create('player');
engine.currentScene.add(player);

for (var i = 0; i < numActors; i++) {
  var actor = new ex.Actor(Math.random() * width, Math.random() * height, 0.2 * 64, 0.2 * 48);

  actor.addDrawing('default', blockSprite.clone());

  actor.body.collider.type = ex.CollisionType.Active;
  actor.body.collider.group = blockGroup;
  actor.on('postupdate', function(e: ex.PostUpdateEvent) {
    if (this.pos.x < 0) {
      this.vel.x = Math.abs(this.vel.x);
    }

    if (this.pos.y < 0) {
      this.vel.y = Math.abs(this.vel.y);
    }

    if (this.pos.x > width) {
      this.vel.x = -1 * Math.abs(this.vel.x);
    }

    if (this.pos.y > height) {
      this.vel.y = -1 * Math.abs(this.vel.y);
    }
  });

  actor.on('postcollision', function(e: ex.PostCollisionEvent) {
    if (e.actor.currentDrawing instanceof ex.Sprite && e.other === player) {
      e.actor.currentDrawing.colorize(ex.Color.Cyan);
    }
  });

  actor.vel.x = ex.Util.randomInRange(minVel, maxVel);
  actor.vel.y = ex.Util.randomInRange(minVel, maxVel);
  engine.add(actor);
}

engine.start(new ex.Loader([blockTexture])).then(() => {
  // do stuff
});
