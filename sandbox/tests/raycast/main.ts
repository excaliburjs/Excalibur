var game = new ex.Engine({
  width: 600,
  height: 400,
  displayMode: ex.DisplayMode.FitScreenAndFill,
  physics: {
    spatialPartition: ex.SpatialPartitionStrategy.DynamicTree
  }
});
var random = new ex.Random(1337);

// collides with everything but players
// var playerGroup = ex.CollisionGroupManager.create('playerGroup');
// var blockGroup = ex.CollisionGroupManager.create('blockGroup');
// var notPlayers = ~playerGroup.category;
// var notPlayers2 = playerGroup.invert();

var playerColliders = new ex.CollisionGroup('playerCollider', 0b0001, ~0b1100);
var bulletColliders = new ex.CollisionGroup('bulletColliders', 0b0010, ~0b1100);
var wallColliders = new ex.CollisionGroup('wallColliders', 0b0100, ~0b1011);
var enemyColliders = new ex.CollisionGroup('enemyColliders', 0b1000, ~0b0111);

var wall1 = new ex.Actor({
  name: 'walls',
  pos: ex.vec(0, 0),
  anchor: ex.vec(0, 0),
  width: game.screen.resolution.width,
  height: 20,
  color: ex.Color.Black,
  collisionGroup: wallColliders
});
game.currentScene.add(wall1);

var wall2 = new ex.Actor({
  name: 'walls',
  pos: ex.vec(game.screen.resolution.width, 0),
  anchor: ex.vec(1, 0),
  width: 20,
  height: game.screen.resolution.height,
  color: ex.Color.Black,
  collisionGroup: wallColliders
});
game.currentScene.add(wall2);

var player = new ex.Actor({
  name: 'player',
  pos: ex.vec(70, 320),
  width: 40,
  height: 40,
  collisionGroup: playerColliders,
  color: ex.Color.Red,
  z: 10
});
var playerDir = ex.Vector.Right;
var playerSightDistance = 2000;
var playerSpeed = 100;
var rotationAmount = Math.PI / 1024;
player.onPostUpdate = (engine) => {
  player.vel = ex.Vector.Zero;
  const keyboard = engine.input.keyboard;
  if (keyboard.isHeld(ex.Keys.ArrowLeft)) {
    playerDir = playerDir.rotate(-rotationAmount);
    player.rotation -= rotationAmount;
  }
  if (keyboard.isHeld(ex.Keys.ArrowRight)) {
    playerDir = playerDir.rotate(+rotationAmount);
    player.rotation += rotationAmount;
  }
  if (keyboard.isHeld(ex.Keys.ArrowUp)) {
    player.vel = playerDir.scale(100);
  }

  // raycast
  var ray = new ex.Ray(player.pos, playerDir);
  var hits = engine.currentScene.physics.rayCast(new ex.Ray(player.pos, playerDir), {
    searchAllColliders: true,
    collisionMask: 0b1100,
    ignoreCollisionGroupAll: true,
    maxDistance: 2000
  });
  ex.Debug.drawRay(ray, { distance: playerSightDistance, color: ex.Color.Red });

  for (let hit of hits) {
    ex.Debug.drawPoint(hit.point, {
      size: 10,
      color: ex.Color.Red
    });
    const hitActor = hit.collider.owner as ex.Actor;
    if (hitActor.name === 'circles') {
      hitActor.graphics.use(
        new ex.Circle({
          color: ex.Color.Violet,
          radius: 10
        })
      );
    }
  }
};
// player.graphics.onPostDraw = (ctx) => {
//   ctx.drawLine(ex.Vector.Zero, ex.Vector.Right.scale(playerSightDistance), ex.Color.Red, 2);
// };
game.currentScene.add(player);

// environment

for (let i = 0; i < 10; i++) {
  var block = new ex.Actor({
    name: 'circles',
    pos: ex.vec(random.floating(0, 600), random.floating(0, 400)),
    radius: 10,
    color: ex.Color.Black,
    collisionGroup: enemyColliders
  });
  game.currentScene.add(block);
}

game.start();
