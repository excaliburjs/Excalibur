import * as ex from 'excalibur';
type Directions = "Left" | "Right" | "Up" | "Down";

// Component Definition
class PlayerMovementComponent extends ex.Component {
  _enabled: boolean = true;
  speed = 150;
  heldKeys: Directions[] = [];
  keyboard: ex.Keyboard;

  constructor(engine: ex.Engine, speed?: number) {
    super();
    if (speed) this.speed = speed;
    this.keyboard = engine.input.keyboard;
  }

  set enable(enable: boolean) {
    this._enabled = enable;
  }

  get enable() {
    return this._enabled;
  }
}

// System Definition
class KeyboardControlSystem extends  ex.System {
  public systemType =  ex.SystemType.Update;
  query:  ex.Query<typeof PlayerMovementComponent | typeof  ex.MotionComponent>;

  constructor(world:  ex.World) {
    super();
    // this tells the query which entities are needed
    this.query = world.query([PlayerMovementComponent,  ex.MotionComponent]);
  }

  update() {
    for (const entity of this.query.entities) {
      // get your components
      const keyboardControl = entity.get(PlayerMovementComponent);
      const movementComponent = entity.get( ex.MotionComponent);

      // enable flag on keyboard control
      if (!keyboardControl.enable) break;
      let speed = keyboardControl.speed;

      // set tracked velocity to zero
      let vX = 0;
      let vY = 0;

      // Check the input keys...

      //Up
      if (keyboardControl.keyboard.isHeld( ex.Keys.W)) {
        // set held direction
        if (!keyboardControl.heldKeys.includes("Up")) keyboardControl.heldKeys.push("Up");
        vY += -speed;
      } else {
        // clear held direction
        const index = keyboardControl.heldKeys.indexOf("Up");
        if (index !== -1) keyboardControl.heldKeys.splice(index, 1);
      }

      //Down
      if (keyboardControl.keyboard.isHeld( ex.Keys.S)) {
        // set held direction
        if (!keyboardControl.heldKeys.includes("Down")) keyboardControl.heldKeys.push("Down");
        vY += speed;
      } else {
        // clear held direction
        const index = keyboardControl.heldKeys.indexOf("Down");
        if (index !== -1) keyboardControl.heldKeys.splice(index, 1);
      }

      //Left
      if (keyboardControl.keyboard.isHeld( ex.Keys.A)) {
        // set held direction
        if (!keyboardControl.heldKeys.includes("Left")) keyboardControl.heldKeys.push("Left");
        vX += -speed;
      } else {
        // clear held direction
        const index = keyboardControl.heldKeys.indexOf("Left");
        if (index !== -1) keyboardControl.heldKeys.splice(index, 1);
      }

      //Right
      if (keyboardControl.keyboard.isHeld( ex.Keys.D)) {
        // set held direction
        if (!keyboardControl.heldKeys.includes("Right")) keyboardControl.heldKeys.push("Right");
        vX += speed;
      } else {
        // clear held direction
        const index = keyboardControl.heldKeys.indexOf("Right");
        if (index !== -1) keyboardControl.heldKeys.splice(index, 1);
      }

      //Set velocity on entity
      movementComponent.vel = new  ex.Vector(vX, vY);
    }
  }
}

const game = new ex.Engine({
    canvasElementId: 'preview-canvas',
    displayMode: ex.DisplayMode.Fixed,
    width: 500,
    height: 500
});

let rootWorld = game.currentScene.world;
// add your new system to the scene's world
rootWorld.add(new KeyboardControlSystem(rootWorld));

const player = new ex.Actor({ x: 300, y: 200, width: 32, height: 32, color: ex.Color.Red });
player.addComponent(new PlayerMovementComponent(game, 100));
game.add(player);
game.start();