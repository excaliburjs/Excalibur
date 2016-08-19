/// <reference path='../../../../dist/excalibur.d.ts' />
var game = new ex.Engine({
    width: 600,
    height: 400
});
game.isDebug = true;
ex.Physics.collisionResolutionStrategy = ex.CollisionResolutionStrategy.RigidBody;
ex.Physics.acc.setTo(0, 100);
function spawnBlock(x, y) {
    var width = ex.Util.randomInRange(20, 100);
    var color = new ex.Color(ex.Util.randomIntInRange(0, 255), ex.Util.randomIntInRange(0, 255), ex.Util.randomIntInRange(0, 255));
    var block = new ex.Actor(x, y, width, width, color);
    block.collisionType = ex.CollisionType.Active;
    game.add(block);
}
function spawnCircle(x, y) {
    var width = ex.Util.randomInRange(20, 100);
    var color = new ex.Color(ex.Util.randomIntInRange(0, 255), ex.Util.randomIntInRange(0, 255), ex.Util.randomIntInRange(0, 255));
    var circle = new ex.Actor(x, y, width, width, color);
    circle.rx = ex.Util.randomInRange(-.5, .5);
    circle.collisionArea = new ex.CircleArea({
        body: circle.body,
        radius: width / 2,
        pos: ex.Vector.Zero.clone()
    });
    circle.moi = circle.collisionArea.getMomentOfInertia();
    circle.collisionType = ex.CollisionType.Active;
    game.add(circle);
}
var ground = new ex.Actor(300, 380, 600, 10, ex.Color.Black.clone());
ground.collisionType = ex.CollisionType.Fixed;
game.add(ground);
var circle = new ex.Actor(300, 380, 20, 20, ex.Color.Azure.clone());
circle.collisionArea = new ex.CircleArea({
    body: circle.body,
    radius: 20,
    pos: ex.Vector.Zero.clone()
});
circle.moi = circle.collisionArea.getMomentOfInertia();
circle.collisionType = ex.CollisionType.Fixed;
//game.add(circle);
//spawnBlock(300, 0);
game.input.keyboard.on('down', function (evt) {
    if (evt.key === ex.Input.Keys.B) {
        spawnBlock(300, 0);
    }
    if (evt.key === ex.Input.Keys.C) {
        spawnCircle(300, 0);
    }
});
game.start();
