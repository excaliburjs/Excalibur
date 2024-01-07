
var game = new ex.Engine({
  width: 600,
  height: 400,
  displayMode: ex.DisplayMode.FitScreenAndFill
});
var random = new ex.Random(1337);
// collides with everything but players
var playerGroup = ex.CollisionGroupManager.create('playerGroup');
var blockGroup = ex.CollisionGroupManager.create('blockGroup');
var notPlayers = ~playerGroup.category;
var notPlayers2 = playerGroup.invert();

var player = new ex.Actor({
  name: 'player',
  pos: ex.vec(100, 100),
  width: 40,
  height: 40,
  collisionGroup: playerGroup,
  color: ex.Color.Red,
  z: 10
});
var playerDir = ex.Vector.Right;
var playerSightDistance = 100;
var playerSpeed = 100;
var rotationAmount = Math.PI / 32;
player.onPostUpdate = (engine) => {
  player.vel = ex.Vector.Zero;
  const keyboard = engine.input.keyboard;
  if (keyboard.isHeld(ex.Keys.ArrowLeft)) {
    playerDir = playerDir.rotate(-rotationAmount)
    player.rotation -= rotationAmount;
  }
  if (keyboard.isHeld(ex.Keys.ArrowRight)){
    playerDir = playerDir.rotate(+rotationAmount)
    player.rotation += rotationAmount;
  }
  if (keyboard.isHeld(ex.Keys.ArrowUp)) {
    player.vel = playerDir.scale(100);
  }

  // raycast
  var hits = engine.currentScene.physics.rayCast(
    new ex.Ray(player.pos, playerDir),
    {
      maxDistance: playerSightDistance,
      // collisionMask: notPlayers,
      collisionGroup: notPlayers2,
      searchAllColliders: false
    });

  for (let hit of hits) {
    const hitActor = hit.collider.owner as ex.Actor;
    hitActor.graphics.use(new ex.Rectangle({
      color: ex.Color.Violet,
      width: 20,
      height: 20
    }));
  }
}
player.graphics.onPostDraw = (ctx) => {
  ctx.drawLine(ex.Vector.Zero, ex.Vector.Right.scale(playerSightDistance), ex.Color.Red, 2);
};
game.currentScene.add(player);

// environment

for (let i = 0; i < 10; i++) {
  var block = new ex.Actor({
    pos: ex.vec(random.floating(0, 600), random.floating(0, 400)),
    width: 20,
    height: 20,
    color: ex.Color.Black,
    collisionType: ex.CollisionType.Fixed,
    collisionGroup: blockGroup
  });
  game.currentScene.add(block);
}

game.start();