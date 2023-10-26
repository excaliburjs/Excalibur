
var game = new ex.Engine({
  width: 600,
  height: 400,
  displayMode: ex.DisplayMode.FitScreenAndFill
});

var actor = new ex.Actor({
  pos: ex.vec(100, 100),
  width: 100,
  height: 100,
  color: ex.Color.Red
});
var moveRight = (amount: number) => {
  actor.vel.x = 100 * amount;
}
var moveLeft = (amount: number) => {
  actor.vel.x = -100 * amount;
}
var moveUp = (amount: number) => {
  actor.vel.y = -100 * amount;
}
var moveDown = (amount: number) => {
  actor.vel.y = 100 * amount;
}
var getLeftStickX = (gamepad: ex.Gamepad) => {
  return gamepad.getAxes(ex.Axes.LeftStickX)
}
var getLeftStickY = (gamepad: ex.Gamepad) => {
  return gamepad.getAxes(ex.Axes.LeftStickY)
}
actor.onInitialize = (engine) => {
  const mapper = engine.inputMapper;
  ex.Gamepads.MinAxisMoveThreshold = .10;
  // Move right
  mapper.on(({keyboard}) => keyboard.isHeld(ex.Keys.Right) ? 1 : 0, moveRight);
  mapper.on(({gamepads}) => gamepads.at(0).getButton(ex.Buttons.DpadRight) ? 1 : 0, moveRight);
  mapper.on(({gamepads}) => getLeftStickX(gamepads.at(0)) > 0 ? Math.abs(getLeftStickX(gamepads.at(0))) : 0, moveRight);
  mapper.on(({keyboard, pointers}) => keyboard.isHeld(ex.Keys.Enter) && pointers.primary.lastWorldPos.x > actor.pos.x ? 1 : 0, moveRight);

  // Move left
  mapper.on(({keyboard}) => keyboard.isHeld(ex.Keys.Left) ? 1 : 0, moveLeft);
  mapper.on(({gamepads}) => gamepads.at(0).getButton(ex.Buttons.DpadLeft) ? 1 : 0, moveLeft);
  mapper.on(({gamepads}) => getLeftStickX(gamepads.at(0)) < 0 ? Math.abs(getLeftStickX(gamepads.at(0))): 0, moveLeft);
  mapper.on(({keyboard, pointers}) => keyboard.isHeld(ex.Keys.Enter) && pointers.primary.lastWorldPos.x < actor.pos.x ? 1 : 0, moveLeft);

  // Move up
  mapper.on(({keyboard}) => keyboard.isHeld(ex.Keys.Up) ? 1 : 0, moveUp);
  mapper.on(({gamepads}) => gamepads.at(0).getButton(ex.Buttons.DpadUp) ? 1 : 0, moveUp);
  mapper.on(({gamepads}) => getLeftStickY(gamepads.at(0)) < 0 ? Math.abs(getLeftStickY(gamepads.at(0))) : 0, moveUp);
  mapper.on(({keyboard, pointers}) => keyboard.isHeld(ex.Keys.Enter) && pointers.primary.lastWorldPos.y < actor.pos.y ? 1 : 0, moveUp);

  // Move down
  mapper.on(({keyboard}) => keyboard.isHeld(ex.Keys.Down) ? 1 : 0, moveDown);
  mapper.on(({gamepads}) => gamepads.at(0).getButton(ex.Buttons.DpadDown) ? 1 : 0, moveDown);
  mapper.on(({gamepads}) => getLeftStickY(gamepads.at(0)) > 0 ? Math.abs(getLeftStickY(gamepads.at(0))) : 0, moveDown);
  mapper.on(({keyboard, pointers}) => keyboard.isHeld(ex.Keys.Enter) && pointers.primary.lastWorldPos.y > actor.pos.y ? 1 : 0, moveDown);
}
game.onPostUpdate = () => {
  actor.vel = ex.vec(0, 0);
}
game.currentScene.add(actor);

game.start();