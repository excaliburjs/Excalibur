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
      // TODO not supported in the current world order
      // e.actor.currentDrawing.colorize(ex.Color.Cyan);
    }
  });

  actor.vel = ex.vec(ex.Util.randomInRange(minVel, maxVel), ex.Util.randomInRange(minVel, maxVel));
  engine.add(actor);
}

engine.start(new ex.Loader([blockTexture])).then(() => {
  // do stuff
});

})();