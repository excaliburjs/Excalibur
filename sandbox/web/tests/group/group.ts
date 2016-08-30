/// <reference path="../../../../dist/excalibur.d.ts" />

var width = 600;
var height = 400;
var minVel = -200;
var maxVel = 200;
var numActors = 300;
var blockTexture = new ex.Texture("block.png");
var engine = new ex.Engine({ width: width, height: height, canvasElementId: 'game' });
//engine.isDebug = true;

var blockGroup = engine.currentScene.createGroup("blocks");
var blockSprite = blockTexture.asSprite();
blockSprite.scale.setTo(.2, .2);

var player = new ex.Actor(width / 2, height / 2, 30, 30, ex.Color.Cyan);
player.collisionType = ex.CollisionType.Fixed;
engine.currentScene.add(player);


for (var i = 0; i < numActors; i++) {
   var actor = new ex.Actor(Math.random() * width, Math.random() * height, .2 * 64, .2 * 48);

   actor.addDrawing("default", blockSprite);

   actor.collisionType = ex.CollisionType.Elastic;
   actor.on('postupdate', function (e: ex.PostUpdateEvent) {
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
   actor.on('collision', function () {
      //console.log('inner collision');
   });

   actor.vel.x = ex.Util.randomInRange(minVel, maxVel);
   actor.vel.y = ex.Util.randomInRange(minVel, maxVel);

   blockGroup.add(actor);
}

blockGroup.on('collision', function (e: ex.CollisionEvent) {
   if (e.other === player) {
      //console.log("collision with player!");
      player.color.r += 1;
      player.color.g -= 1;
      player.color.b -= 1;
   }
});


engine.start(new ex.Loader([blockTexture])).then(() => {
   // do stuff
}); 