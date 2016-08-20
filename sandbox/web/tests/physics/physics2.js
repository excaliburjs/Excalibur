/// <reference path='../../../../dist/excalibur.d.ts' />
var game = new ex.Engine({
    width: 600,
    height: 400
});
game.isDebug = true;
ex.Physics.collisionResolutionStrategy = ex.CollisionResolutionStrategy.RigidBody;
ex.Physics.broadphaseDebug = true;
game.currentScene.camera.setFocus(0, 0);
game.currentScene.camera.zoom(3);
function spawnCircle2(x, y, vx) {
    var width = 20;
    var color = new ex.Color(ex.Util.randomIntInRange(0, 255), ex.Util.randomIntInRange(0, 255), ex.Util.randomIntInRange(0, 255));
    var circle = new ex.Actor(x, y, width, width, color);
    circle.vel.x = vx;
    circle.body.useCircleCollision(width / 2);
    circle.collisionType = ex.CollisionType.Active;
    game.add(circle);
}
spawnCircle2(0, 0, 10);
spawnCircle2(19, 0, -10);
game.start();
