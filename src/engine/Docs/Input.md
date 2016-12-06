# Working with Input

Excalibur offers several modes of input for your games.

The [[Engine.input]] property that can be inspected during [[Actor.update]]
or other areas of the game. This makes it easy to respond to any type
of user input without writing complex input event code.

Learn more about [[Pointers|Mouse and Touch]], [[Keyboard]], and [[Gamepads|Controller]] support.

## Inspecting engine input

Access [[Engine.input]] to see if any input is being tracked during the current update frame.

```ts
class Player extends ex.Actor {
  public update(engine, delta) {
    if (engine.input.keyboard.isKeyDown(ex.Input.Keys.W) ||
        engine.input.gamepads.at(0).getAxes(ex.Input.Axes.LeftStickY) > 0.5) {
      
      player._moveForward();
    }
  }
}
```