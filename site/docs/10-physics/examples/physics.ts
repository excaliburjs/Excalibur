import * as ex from 'excalibur';

const game = new ex.Engine({
  canvasElementId: 'preview-canvas',
  displayMode: ex.DisplayMode.FillContainer,
});

const box = new ex.Actor({
    pos: ex.vec(game.halfDrawWidth, -100),
    width: 50,
    height: 50,
    rotation: Math.PI / 3,
    color: ex.Color.Red,
    collisionType: ex.CollisionType.Active
});

const trianglePoints = [ex.vec(-20, 20), ex.vec(0, -20), ex.vec(20, 20)];
const triangle = new ex.Actor({
    pos: ex.vec(game.halfDrawWidth, 100),
    rotation: Math.PI / 3,
    collider: new ex.PolygonCollider({points: trianglePoints}),
    collisionType: ex.CollisionType.Active
});
const triangleGraphic = new ex.Polygon({points: trianglePoints, color: ex.Color.Green});
triangle.graphics.use(triangleGraphic);

const circle = new ex.Actor({
    pos: ex.vec(game.halfDrawWidth + 20, -200),
    radius: 30,
    color: ex.Color.Yellow,
    collisionType: ex.CollisionType.Active
});

const ground = new ex.Actor({
    pos: ex.vec(game.halfDrawWidth, game.drawHeight),
    width: game.drawWidth,
    height: 100,
    color: ex.Color.DarkGray,
    collisionType: ex.CollisionType.Fixed
});
game.start().then(() => {
    game.currentScene.physics.config.solver = ex.SolverStrategy.Realistic;
    game.currentScene.physics.config.gravity = ex.vec(0, 300);
    game.currentScene.add(box);
    game.currentScene.add(circle);
    game.currentScene.add(triangle);
    game.currentScene.add(ground);
    game.currentScene.camera.pos = ex.vec(game.halfDrawWidth, game.halfDrawHeight);
});