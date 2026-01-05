import * as ex from 'excalibur';

/******************************
 Our Child Actor
*******************************/
export class HealthBar extends ex.Actor {
  constructor(pos: ex.Vector, dims: ex.Vector, maxHealth: number) {
    super({
      pos,
      width: dims.x,
      height: dims.y,
      color: ex.Color.White
    });
  }
}

/******************************
 Engine Setup
*******************************/
const game = new ex.Engine({
  canvasElementId: 'preview-canvas',
  displayMode: ex.DisplayMode.Fixed,
  width: 500,
  height: 500,
  pixelArt: true
});

/******************************
 Setting up the parent actor
*******************************/
const player = new ex.Actor({ x: 300, y: 200, width: 32, height: 32, color: ex.Color.Red });
player.addChild(new HealthBar(ex.vec(0, -24), ex.vec(36, 6), 100));
game.add(player);
game.start();

/******************************
 Zoom in on the actor, just to 
 make it easier to see
*******************************/
game.currentScene.camera.strategy.lockToActor(player);
game.currentScene.camera.zoom = 2.5;
